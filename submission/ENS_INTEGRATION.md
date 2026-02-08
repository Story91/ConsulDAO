# ENS Integration - Project Identity

## 🎯 Prize Track: ENS ($5,000)

**Tracks**:
- Integrate ENS ($5,000 pool)
- Creative DeFi Use ($1,500)

---

## Overview

ConsulDAO uses **ENS subdomains** as on-chain identities for incubated projects. When a project is accepted, it automatically receives a subdomain: `projectname.consul.eth`

This is **not** just a name - it's an **on-chain database** storing project metadata via text records.

---

## How It Works

### 1. Project Registration

When AI Agent accepts a project:

```typescript
// Generate subdomain
const subdomain = generateProjectSubdomain("My DeFi Project");
// → "my-defi-project.consul.eth"

// Create manifest
const manifest = createProjectManifest({
    name: "My DeFi Project",
    description: "A revolutionary DeFi protocol",
    founder: "0x1234...5678",
    stage: "incubating",
    createdAt: Date.now()
});
```

### 2. ENS Text Records

We store project data in ENS text records:

| Key | Example Value |
|-----|---------------|
| `consul.name` | My DeFi Project |
| `consul.description` | A revolutionary DeFi protocol |
| `consul.founder` | 0x1234...5678 |
| `consul.stage` | incubating |
| `consul.manifest` | ipfs://Qm... |

### 3. On-Chain Registration

```typescript
// hooks/useENS.ts
export function useENSRegistration(projectName: string) {
    const { writeContract } = useWriteContract();
    
    const registerProject = async () => {
        // 1. Create subdomain
        await writeContract({
            address: ENS_REGISTRY,
            abi: ENS_REGISTRY_ABI,
            functionName: "setSubnodeRecord",
            args: [
                parentNode,      // namehash("consul.eth")
                labelHash,       // keccak256("my-project")
                ownerAddress,    // Project founder
                resolverAddress, // Public resolver
                ttl             
            ],
            chainId: sepolia.id  // ENS on Ethereum Sepolia
        });
        
        // 2. Set text records
        await writeContract({
            address: ENS_PUBLIC_RESOLVER,
            abi: PUBLIC_RESOLVER_ABI,
            functionName: "setText",
            args: [node, "consul.name", "My DeFi Project"],
            chainId: sepolia.id
        });
    };
    
    return { registerProject };
}
```

---

## Cross-Chain Architecture

| Operation | Chain | Reason |
|-----------|-------|--------|
| ENS Registration | Ethereum Sepolia | ENS lives on Ethereum |
| Smart Contracts | Base Sepolia | Lower gas, faster txs |
| Token Operations | Base Sepolia | Uniswap v4 pools |

### Network Switching

```typescript
// components/NetworkSwitcher.tsx
export function NetworkSwitcher({ targetChainId }) {
    const { switchChain } = useSwitchChain();
    
    return (
        <Button onClick={() => switchChain({ chainId: targetChainId })}>
            Switch to {targetChain.name}
        </Button>
    );
}
```

The incubator UI automatically prompts users to switch networks:
- **Sepolia** for ENS operations
- **Base Sepolia** for contract interactions

---

## Incubator Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    AI Incubator Chat                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  User: "Start my project called DeFi Protocol"              │
│                                                              │
│  Agent: ✅ Session created!                                  │
│         📛 ENS: defi-protocol.consul.eth                    │
│         🔗 Network: Ethereum Sepolia                        │
│                                                              │
│  [Mint ENS Identity]  ← Triggers network switch + tx        │
│                                                              │
│  Agent: ✅ ENS subdomain minted!                            │
│         📝 Text records set                                 │
│         🔍 View on Etherscan: [link]                        │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## ENS as On-Chain Database

### Why ENS?

1. **Decentralized**: No centralized server
2. **Verifiable**: Anyone can resolve and verify
3. **Composable**: Other dApps can read project data
4. **Human-readable**: `myproject.consul.eth` vs `0x...`

### Query Project Data

```typescript
// Anyone can read project info
const name = await resolver.text(node, "consul.name");
const founder = await resolver.text(node, "consul.founder");
const stage = await resolver.text(node, "consul.stage");
```

### Future: IPFS Manifest

```typescript
// Store full manifest on IPFS
const manifest = {
    name: "My Project",
    description: "...",
    team: ["0x...", "0x..."],
    milestones: [...],
    funding: {...}
};

const cid = await ipfs.add(JSON.stringify(manifest));
await resolver.setText(node, "consul.manifest", `ipfs://${cid}`);
```

---

## Transaction Proofs

| Action | TxHash | Status |
|--------|--------|--------|
| Subdomain Creation | [TBD] | ⏳ |
| Text Record Set | [TBD] | ⏳ |
| Resolution Test | [TBD] | ⏳ |

---

## Prize Requirements Checklist

| Requirement | Status |
|-------------|--------|
| ✅ Custom ENS code | Not RainbowKit - custom hooks |
| ✅ Functional demo | Incubator chat interface |
| ⏳ Real transactions | Pending Sepolia ETH |
| ⏳ Video or live demo | Pending |
| ✅ Open source | GitHub repo |

---

## Creative Use Case

### "ENS as Project Registry"

Instead of a traditional database:
- Project identity = ENS subdomain
- Project metadata = Text records
- Project manifest = IPFS via ENS
- Ownership = ENS ownership transfer

This makes the entire project registry **decentralized and verifiable**.

---

## Files

| File | Description |
|------|-------------|
| `lib/ens.ts` | ENS utilities |
| `hooks/useENS.ts` | React hooks for ENS |
| `components/NetworkSwitcher.tsx` | Network switching UI |
| `app/incubator/page.tsx` | Chat with ENS minting |

---

## Testing Guide

### 1. Get Sepolia ETH
- [Alchemy Faucet](https://sepoliafaucet.com/)
- [Infura Faucet](https://www.infura.io/faucet/sepolia)

### 2. Test ENS Registration
```bash
# In the app
1. Go to /incubator
2. Connect wallet
3. Type "Start my project called TestProject"
4. Click "Mint ENS Identity"
5. Approve transaction on Sepolia
```

### 3. Verify on Etherscan
- Check ENS Registry: `0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e`
- Look for `NewOwner` event with your subdomain

---

## Resources

- [ENS Docs](https://docs.ens.domains/)
- [Text Records](https://docs.ens.domains/web/records)
- [Sepolia ENS App](https://app.ens.domains/) (switch to Sepolia)

