pragma solidity 0.5.6;

import { Dependency } from "./Dependency.sol";

contract TestRig
{
    Dependency public dependency;
    bool public reverted;

    constructor(Dependency _dependency)
        public
    {
        dependency = _dependency;
    }

    function justRevert()
        public
    {
        reverted = true;
        revert("I just revert");
    }

    function callRevertingDependency()
        public
    {
        reverted = true;
        dependency.justRevert();
    }
}
