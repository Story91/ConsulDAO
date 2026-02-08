# ENS Testing Guide - ConsulDAO

## Overview

ConsulDAO uses **Sepolia testnet** for ENS subdomain minting. This guide walks you through testing the ENS integration.

## Prerequisites

### 1. Get Sepolia Testnet ETH

You need Sepolia ETH to pay for ENS transactions:

**Faucets:**
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia
- https://faucets.chain.link/sepolia

**Amount needed:** ~0.01 ETH (enough for several ENS transactions)

### 2. Add Sepolia to Your Wallet

**MetaMask:**
1. Click network dropdown
2. Click "Add Network"
3. Select "Sepolia" from the list

**Coinbase Wallet:**
1. Settings → Networks
2. Enable "Testnets"
3. Select "Sepolia"

**Network Details:**
```
Network Name: Sepolia
RPC URL: https://rpc.sepolia.org
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer: https://sepolia.etherscan.io
```

## Testing Flow

### Step 1: Start Incubation

1. Go to https://localhost:3000/incubator
2. Connect your wallet
3. Type: **"Start my project called DeFiHub"**
4. Agent will create a session

### Step 2: ENS Minting

1. Agent will ask for ENS subdomain
2. Type: **"defihub"** (lowercase, 3-32 chars)
3. Agent will show: `defihub.consul.eth`
4. Click **"Mint ENS Identity"**

### Step 3: Network Switch

1. **Network Switcher** will appear in sidebar
2. Click **"Switch Network"** button
3. Wallet will prompt to switch to Sepolia
4. Approve the network switch

### Step 4: Approve Transaction

1. Wallet will open with transaction details
2. **Contract:** ENS Public Resolver (`0x8FADE...`)
3. **Function:** `setText`
4. **Gas:** ~0.0001 ETH
5. Click **"Confirm"**

### Step 5: Wait for Confirmation

1. Transaction submitted message appears
2. Wait 10-30 seconds for block confirmation
3. Success message with Etherscan link

### Step 6: Verify on Etherscan

1. Click the Etherscan link in success message
2. Verify transaction status: ✅ Success
3. Check "Logs" tab for `TextChanged` event
4. Verify text record was set

## Expected Results

### Transaction Details

```
To: 0x8FADE66B79cC9f707aB26799354482EB93a5B7dD (ENS Public Resolver)
Function: setText(bytes32 node, string key, string value)
Key: "consul.manifest"
Value: {"name":"DeFiHub","description":"DeFiHub - Incubated by ConsulDAO",...}
```

### Success Indicators

- ✅ Transaction confirmed on Sepolia
- ✅ Text record set for subdomain
- ✅ ENS name appears in sidebar: `defihub.consul.eth`
- ✅ Etherscan shows successful transaction

## Troubleshooting

### "Insufficient funds"
- Get more Sepolia ETH from faucets
- Need at least 0.001 ETH for gas

### "Wrong network"
- Make sure you're on Sepolia (Chain ID: 11155111)
- Use Network Switcher in sidebar

### "Transaction failed"
- Check if you have enough gas
- Try increasing gas limit in wallet
- Verify ENS name format (lowercase, no spaces)

### "User rejected transaction"
- Click "Mint ENS Identity" again
- Approve in wallet when prompted

## Verifying ENS Records

### Using Etherscan

1. Go to https://sepolia.etherscan.io/address/0x8FADE66B79cC9f707aB26799354482EB93a5B7dD
2. Click "Contract" → "Read Contract"
3. Function `text`:
   - `node`: (namehash of your ENS name)
   - `key`: `consul.manifest`
4. Click "Query" to see your manifest

### Using ENS App (Future)

ENS app doesn't fully support Sepolia subdomains yet, but you can verify the parent domain:
- https://app.ens.domains/consul.eth

## Demo Video Checklist

When recording demo for hackathon:

- [ ] Show wallet with Sepolia ETH balance
- [ ] Show network switch prompt
- [ ] Show wallet transaction approval
- [ ] Show "waiting for confirmation" state
- [ ] Show success message with Etherscan link
- [ ] Click Etherscan link and show transaction
- [ ] Show ENS name in sidebar
- [ ] Explain: "This is real ENS on Sepolia testnet"

## Prize Submission

For ENS prize submission, document:

1. **Transaction Hash**: Copy from success message
2. **ENS Name**: e.g., `defihub.consul.eth`
3. **Etherscan Link**: https://sepolia.etherscan.io/tx/0x...
4. **Text Record Key**: `consul.manifest`
5. **Text Record Value**: Project manifest JSON

Example for README:

```markdown
## ENS Integration

Real ENS subdomain minting on Sepolia testnet.

**Example Transaction:**
- ENS Name: `defihub.consul.eth`
- Transaction: https://sepolia.etherscan.io/tx/0x123...
- Text Record: `consul.manifest` → Project metadata
```

## Next Steps

After ENS is working:

1. Test with different project names
2. Verify text records are readable
3. Add more text records (avatar, url, etc.)
4. Integrate with other contracts on Base Sepolia
5. Record demo video showing full flow

## Resources

- ENS Docs: https://docs.ens.domains
- Sepolia Etherscan: https://sepolia.etherscan.io
- ENS Public Resolver: `0x8FADE66B79cC9f707aB26799354482EB93a5B7dD`
- Sepolia Faucets: https://sepoliafaucet.com/

