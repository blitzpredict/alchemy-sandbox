import _ from "lodash";
import fs from "fs";
import glob from "glob";
import { assert } from "chai";
import { ethers } from "ethers";
import { RevertTraceSubprovider, SolCompilerArtifactAdapter } from "@0x/sol-trace";
import { Web3ProviderEngine, GanacheSubprovider, FakeGasEstimateSubprovider } from "@0x/subproviders";

const numAccounts = 5;

export default class ContractTestHelper {
    static create = async () => {
        const instance = new ContractTestHelper();

        await instance._init();

        return instance;
    }

    _init = async () => {
        this.contractDataByName = {};

        const files = glob.sync("./artifacts/*.json")

        _.each(files, (filename) => {
            const json = fs.readFileSync(filename);
            const contractData = JSON.parse(json);
            const contractName = contractData.contractName;

            this.contractDataByName[contractName] = contractData;
        });

        const defaultFromAddress = "0x5409ed021d9299bf6814279a6a1411a7e866a631";
        const artifactAdapter = new SolCompilerArtifactAdapter("./artifacts", "./contracts");
        const revertTraceSubprovider = new RevertTraceSubprovider(artifactAdapter, defaultFromAddress, true);

        const providerEngine = new Web3ProviderEngine();
        providerEngine.addProvider(new FakeGasEstimateSubprovider(4 * (10 ** 6)));
        providerEngine.addProvider(revertTraceSubprovider);
        providerEngine.addProvider(new GanacheSubprovider({
            mnemonic: "concert load couple harbor equip island argue ramp clarify fence smart topic",
            gasLimit: "0x6691b70"
        }));
        providerEngine.start();

        this.provider = new ethers.providers.Web3Provider(providerEngine);
        this.signers = _.times(numAccounts, n => this.provider.getSigner(n));

        this.addresses = _.times(numAccounts);
        await Promise.all(_.map(this.signers, async (signer, i) => {
            this.addresses[i] = await signer.getAddress();
        }));
    }

    deployContract = async (contractName, ...constructorArgs) => {
        const contractData = this.contractDataByName[contractName];
        if (!contractData) {
            throw new Error(`Could not find contract named "${contractName}`);
        }

        const abi = contractData.compilerOutput.abi;
        const bytecode = contractData.compilerOutput.evm.bytecode.object;
        const contractFactory = new ethers.ContractFactory(abi, bytecode, this.signers[0]);

        const contract = await contractFactory.deploy(...constructorArgs);

        await contract.deployed();

        return contract;
    }

    waitForTx = async (txPromise, options = {}) => {
        const tx = await txPromise;

        return tx.wait();
    }

    shouldRevert = async (promise, message, options = {}) => {
        let receipt;
        let reverted;

        try {
            const tx = await promise;

            receipt = await tx.wait();
        } catch (err) {
            reverted = true;
            err.message.should.include(`revert ${message}`);
        }

        assert(reverted, `Did not revert.  Receipt: ${JSON.stringify(receipt, null, 4)}`);
    }
}
