"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const path = __importStar(require("path"));
const assert = __importStar(require("assert"));
const ttm = __importStar(require("azure-pipelines-task-lib/mock-test"));
describe('VersionReaderTask v2 tests', function () {
    before(function () {
    });
    after(() => {
    });
    // test that task fails 
    it('Fails if no project spec is given', function (done) {
        let tp = path.join(__dirname, 'inputTest.js');
        let tr = new ttm.MockTestRunner(tp);
        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, false, 'should have failed');
        assert.equal(tr.errorIssues.length, 1, "should have 1 error");
        assert.equal(tr.errorIssues[0], 'Unhandled: Input required: searchPattern', 'Should fail if no searchPattern provided');
        console.log(tr.stdout);
        done();
    });
    // task runs with file specified
    it('Runs if "searchPattern" is set', function (done) {
        let tp = path.join(__dirname, 'runVersion.js');
        let tr = new ttm.MockTestRunner(tp);
        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.errorIssues.length, 0, "should have 0 errors");
        console.log(tr.stdout);
        done();
    });
    it('Variables and build values are set', function (done) {
        // reads the Version.csproj file with no prefix
        let tp = path.join(__dirname, 'runVersion.js');
        let tr = new ttm.MockTestRunner(tp);
        // mock build ID
        process.env.BUILD_BUILDID = "5678";
        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.errorIssues.length, 0, "should have 0 errors");
        console.log(tr.stdout);
        assertSet(tr, "VERSION_BUILD", "1.2.3.5678");
        assertSet(tr, "Version", "1.2.3");
        assertSet(tr, "AssemblyVersion", "1.2.4");
        assertSet(tr, "VersionPrefix", "1.2.5");
        assertSet(tr, "VersionSuffix", "alpha");
        assertSet(tr, "PackageVersion", "1.2.6");
        assertSet(tr, "FileVersion", "1.2.7");
        done();
    });
    it('Variables have Prefix applied if set', function (done) {
        // reads the Version.csproj file with TEST prefix
        let tp = path.join(__dirname, 'runVersionWithPrefix.js');
        let tr = new ttm.MockTestRunner(tp);
        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.errorIssues.length, 0, "should have 0 errors");
        console.log(tr.stdout);
        assertSet(tr, "TEST_VERSION_BUILD", "1.2.3.5678");
        assertSet(tr, "TEST_Version", "1.2.3");
        assertSet(tr, "TEST_AssemblyVersion", "1.2.4");
        assertSet(tr, "TEST_VersionPrefix", "1.2.5");
        assertSet(tr, "TEST_VersionSuffix", "alpha");
        assertSet(tr, "TEST_PackageVersion", "1.2.6");
        assertSet(tr, "TEST_FileVersion", "1.2.7");
        done();
    });
    it('Version reverts to 1.0.0 if not found', function (done) {
        // reads the Version.csproj file with TEST prefix
        let tp = path.join(__dirname, 'runVersionMissing.js');
        let tr = new ttm.MockTestRunner(tp);
        tr.run();
        console.log(tr.succeeded);
        assert.equal(tr.succeeded, true, 'should have succeeded');
        assert.equal(tr.errorIssues.length, 0, "should have 0 errors");
        console.log(tr.stdout);
        // version 1.0.0 is assumed
        assertSet(tr, "VERSION_BUILD", "1.0.0.5678");
        // version prefix will be set with 1.0.0
        assertSet(tr, "VersionPrefix", "1.0.0");
        done();
    });
});
// check an environment var was set
function assertSet(tr, envVar, value) {
    var expected = `##vso[task.setvariable variable=${envVar};issecret=false;]${value}`;
    assert.equal(true, tr.stdOutContained(expected));
}
