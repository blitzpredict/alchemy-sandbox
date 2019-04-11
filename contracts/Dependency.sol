pragma solidity 0.5.6;

contract Dependency
{
    function justRevert()
        public
        pure
    {
        revert("I just revert");
    }
}
