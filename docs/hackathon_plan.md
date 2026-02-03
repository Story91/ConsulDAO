One week is not enough time to build a platform. It **is** enough time to build a **"Vertical Slice"**—a single, polished user flow that demos every sponsor feature in 5 minutes.

Your goal is not to finish the product. Your goal is to **build the Demo Story.**

Here is your **One-Week Survival Plan** to win the "Agentic" + "Infrastructure" prizes.

### The Strategy: "The Autonomous Incubator"

Instead of building the whole DAO, build **one specific flow**: An AI Agent that incubates *one* project, gives it an identity (ENS), manages its budget (Arc/Circle), handles its operations (Yellow), and launches its token (Uniswap v4).

---

### Day 1: The "Identity & Ops" Layer (ENS + Yellow)

**Goal:** Prove "Day 0" setup is instant and gasless.

* **ENS Integration (Easy Win):**
* *Feature:* **"Instant Brand Identity."** When a project is accepted, the DAO automatically mints a subdomain: `projectname.consul.eth`.
* *Tech:* Use `wagmi` hooks to write a Text Record to this ENS name containing the project's "Manifest" (IPFS link).
* *Prize Angle:* "We use ENS as the **On-chain Database** for our incubated projects, not just a name."


* **Yellow Network Integration (The "Agentic" Ops):**
* *Feature:* **"The Boardroom Channel."** The Founder and the "AI Agent" open a Yellow State Channel.
* *Action:* They sign 50 "micro-agreements" (e.g., "Approve logo," "Approve tweet," "Release $50 budget") off-chain.
* *Prize Angle:* "We used Yellow to make DAO governance **real-time and gasless**. We only settle on-chain once the milestone is complete."



### Day 2: The "Money" Layer (Arc + Circle + AgentKit)

**Goal:** Show the AI managing money intelligently.

* **Arc (Circle) Integration:**
* *Feature:* **"Cross-Chain Payroll."**
* *Scenario:* The project is on Base, but a contractor wants payment on Arbitrum.
* *Agent Action:* Your **Robo-CFO Agent** (using Coinbase AgentKit) detects the invoice. It calls the **Circle CCTP** (Cross-Chain Transfer Protocol) via Arc to bridge USDC and pay the contractor in one click.
* *Prize Angle:* "Autonomous Treasury that solves **Liquidity Fragmentation** using Circle infrastructure."



### Day 3: The "Launch" Layer (Uniswap v4)

**Goal:** Show a "Smarter" Token Launch.

* **Uniswap v4 Hook:**
* *Feature:* **"The Anti-Rug Hook."**
* *Logic:* Create a custom Hook for the project's liquidity pool.
* *The Hook:* `beforeSwap()` checks if the seller is the Founder. If `Time < 1 Year`, the transaction reverts.
* *Prize Angle:* "We don't just launch tokens; we enforce **On-Chain Vesting** directly at the DEX level using Uniswap v4 Hooks."



### Day 4 & 5: The "Glue" (Frontend & Agents)

* **Frontend (MiniApp):**
* Don't build a complex dashboard. Build a **Chat Interface**.
* *User Flow:* User types "Launch my project."  Agent replies "Identity minted (ENS)."  "Channel Open (Yellow)."  "Liquidity Deployed (Uniswap)."
* *Tech:* Use the **Base Miniapp Template** you already have. The "Chat" is just a feed of these on-chain events.


* **The "Agent" Script:**
* Write a simple Node.js script using **Coinbase AgentKit**.
* Give it a wallet with small ETH/USDC.
* Hardcode the sequence: `Mint ENS`  `Open Yellow Channel`  `Deploy Uniswap Pool`.
* *Cheat:* You don't need a complex LLM brain. For the hackathon, a scripted "Agent" that *looks* autonomous is fine.



### Day 6: The Demo Video (Crucial)

Judges might not run your code. The video is everything.

* **0:00 - 0:30:** "DAOs are slow. We made them Agentic."
* **0:30 - 1:00:** Show the **Yellow Network** "Speed" (Clicking buttons instantly without wallet popups).
* **1:00 - 1:30:** Show the **Uniswap Hook** rejecting a "Founder Dump" transaction (Red text = Win).
* **1:30 - 2:00:** Show the **Arc/Circle** payment arriving on another chain.

### What to Cut (The "Ignore" List)

* **Legal Escrow:** Too complex for 1 week. Fake it with a simple "Vault" contract.
* **Talent Squad:** Cut it. Just show the "AI Agent" as the talent.
* **Complex Voting:** Cut it. Use the "Yellow Channel" agreement as the "Vote."

**Technical "Must-Have" Checklist for Developer:**

1. [x] **Uniswap v4:** `AntiRugHook.sol` - Complete with beforeSwap vesting logic ✅
2. [ ] **Yellow:** `Nitrolite SDK` setup for a simple 2-party channel (BONUS)
3. [x] **Arc/Circle:** `lib/circle.ts` - USDC addresses, CCTP utilities, payment types ✅
4. [x] **Agent:** `lib/agent.ts` + `/api/agent` - Incubation flow with simulated actions ✅
5. [x] **ENS:** `lib/ens.ts` - Subdomain generation + manifest utilities ✅
6. [x] **Frontend:** Chat interface at `/incubator` ✅
7. [x] **Landing Page:** Professional design with shadcn/ui ✅

**Remaining:**
- [ ] Deploy contracts to Base Sepolia
- [ ] Real ENS minting transactions
- [ ] Demo video (3 min)