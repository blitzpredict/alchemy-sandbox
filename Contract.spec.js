import ContractTestHelper from "./ContractTestHelper.js";

describe("Demonstrate @0x/sol-trace", () => {
    let helper;
    let Dependency;
    let TestRig;

    beforeEach(async () => {
        helper = await ContractTestHelper.create();
        Dependency = await helper.deployContract("Dependency");
        TestRig = await helper.deployContract("TestRig", Dependency.address);
    });

    it("should work for a simple stack trace", async () => {
        await helper.shouldRevert(
            TestRig.justRevert(),
            "I just revert",
            {
                enableRevertTraceLogging: true
            }
        );
    });

    it("should work for a nested stack trace", async () => {
        await helper.shouldRevert(
            TestRig.callRevertingDependency(),
            "I just revert",
            {
                enableRevertTraceLogging: true
            }
        );
    });
});
