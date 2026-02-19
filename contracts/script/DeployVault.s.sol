// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {Vault} from "../src/Vault.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeployVault is Script {
    function run() external returns (Vault) {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address asset = vm.envAddress("ASSET_ADDRESS");
        address owner = vm.envAddress("OWNER_ADDRESS");
        string memory name = vm.envString("VAULT_NAME");
        string memory symbol = vm.envString("VAULT_SYMBOL");

        vm.startBroadcast(deployerPrivateKey);
        Vault vault = new Vault(
            name,
            symbol,
            IERC20(asset),
            owner
        );
        vm.stopBroadcast();

        console.log("Vault Address:", address(vault));

        return vault;
    }
}
