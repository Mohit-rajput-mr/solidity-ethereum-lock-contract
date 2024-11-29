const { ethers } = require("hardhat");

async function main() {
    const Lock = await ethers.getContractFactory("Lock");
    const unlockTime = Math.floor(Date.now() / 1000) + 60; // 60 seconds later

    const lock = await Lock.deploy(unlockTime, {
        value: ethers.parseEther("1"), // Deploying with 1 ETH
    });

    console.log(`Contract deployed to: ${lock.target}`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
