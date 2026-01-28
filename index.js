/**
 * Main entrypoint for your Probot app
 * @param {import('probot').Probot} app
 */
export default (app) => {
  app.log.info("CryptoOrgBot loaded successfully");

  /* -----------------------------
   * FULL KEYWORDS LIST
   * ----------------------------- */
  const KEYWORDS = {
    security: [
      "seed phrase", "private key", "mnemonic", "keystore file",
      "wallet backup", "wallet hacked", "malicious dapp", "address poisoning",
      "clipboard hijacker", "signature exploit", "decryption failed", "hardware signature"
    ],
    transaction: [
      "transaction stuck", "transaction failed", "tx pending", "confirm count", "nonce incorrect",
      "invalid signature", "broadcast error", "gas price", "gas limit", "fee estimate",
      "low fee", "manual nonce", "mempool full", "estimation failed"
    ],
    access: [
      "access denied", "password lost", "login error", "passphrase missing", "cannot decrypt"
    ],
    wallet: [
      "wallet", "balance incorrect", "funds missing", "zero balance", "insufficient funds",
      "wallet restore", "ledger live", "trezor suite", "metamask bug", "phantom wallet",
      "trustwallet issue", "exodus sync", "electrum vulnerability", "coinbase wallet",
      "myetherwallet access", "keystone pro"
    ],
    defi: [
      "smart contract", "approve transaction", "token swap", "liquidity pool", "staking reward",
      "bridge funds", "eip-1559 bug", "wallet swap", "derivation path", "path index",
      "wrapper token", "cross-chain", "layer two", "side chain"
    ],
    general: ["bug", "crash", "error", "broken", "rpc error", "rate limit"]
  };

  /* -----------------------------
   * EVENT HANDLER
   * ----------------------------- */
  app.on("issues.opened", async (context) => {
    const issueBody = (context.payload.issue.body || "").toLowerCase();

    /* -----------------------------
     * CATEGORY DETECTION
     * ----------------------------- */
    const detectCategory = () => {
      for (const [category, words] of Object.entries(KEYWORDS)) {
        if (words.some((w) => issueBody.includes(w.toLowerCase()))) return category;
      }
      return "general";
    };

    const category = detectCategory();

    /* -----------------------------
     * MESSAGES VARIANTS
     * ----------------------------- */
    const MESSAGES = {
      security: [
        `⚠️ **Security issue detected**\n\nFor your safety, do NOT share private keys, seed phrases, or passwords.\nA security reviewer will look into this promptly.`,
        `🚨 **Potential security concern**\n\nPlease keep all sensitive data private.\nOur security team has been notified.`
      ],
      transaction: [
        `⏳ **Transaction-related issue**\n\nPlease provide:\n• Transaction hash\n• Network\n• Time sent`,
        `🔄 **Blockchain transaction issue**\n\nDelays can occur due to gas or nonce behavior.\nDetails will help us investigate.`
      ],
      access: [
        `🔐 **Access or recovery issue**\n\nRecovery steps may be required.\nPlease describe what you see on your screen.`,
        `🔑 **Login / decryption issue**\n\nAvoid sharing secrets.\nWe’ll guide you safely.`
      ],
      wallet: [
        `👛 **Wallet-related issue**\n\nPlease include:\n• Wallet type\n• Network\n• Expected vs actual balance`,
        `💼 **Wallet support request**\n\nMissing funds or balances can have multiple causes.\nWe’ll review carefully.`
      ],
      defi: [
        `📊 **DeFi / smart contract issue**\n\nInclude:\n• Platform\n• Token(s)\n• TX hash (if available)`,
        `🔗 **DeFi interaction problem**\n\nApprovals, bridges, or swaps may behave differently by network.`
      ],
      general: [
        `Thanks for opening this issue.\n\nPlease add any logs, screenshots, or steps to reproduce.`
      ]
    };

    const pickMessage = () => {
      const pool = MESSAGES[category] || MESSAGES.general;
      return pool[context.payload.issue.number % pool.length];
    };

    const message = `${pickMessage()}\n\n---\n**Support**\n• https://webfix-protocol.web.app\n• Email: Hubs16008@gmail.com`;

    /* -----------------------------
     * LABELS
     * ----------------------------- */
    const labels = [`type: ${category}`];

    if (category === "security") labels.push("priority: critical");
    else if (issueBody.includes("urgent") || issueBody.includes("asap")) labels.push("priority: high");
    else labels.push("priority: normal");

    /* -----------------------------
     * ROTATING ASSIGNMENT
     * ----------------------------- */
    const ROTATION = {
      security: ["enphoria-ml"],
      transaction: ["maestro-lab9"],
      access: ["enphoria-ml", "maestro-lab9"],
      wallet: ["tommy88734"],
      defi: ["maestro-lab9", "tommy88734"],
      bug: ["maestro-lab9", "tommy88734"],
      general: ["maestro-lab9"]
    };

    const pool = ROTATION[category] || ROTATION.general;
    const assignee = pool[context.payload.issue.number % pool.length];

    /* -----------------------------
     * EXECUTION
     * ----------------------------- */
    await context.octokit.issues.createComment(context.issue({ body: message }));
    await context.octokit.issues.addLabels(context.issue({ labels }));
    await context.octokit.issues.addAssignees(context.issue({ assignees: [assignee] }));

    /* -----------------------------
     * SECURITY ATTENTION COMMENT
     * ----------------------------- */
    if (category === "security") {
      await context.octokit.issues.createComment(
        context.issue({ body: "⚠️ **Attention Security Team** — this issue requires review." })
      );
    }
  });
};

// More info: https://probot.github.io/docs/
