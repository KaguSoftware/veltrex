# Agent instructions

The authoritative rules for this repository live in [CLAUDE.md](./CLAUDE.md). Read that file first.

This file exists for two reasons:

1. Tools that look for `AGENTS.md` rather than `CLAUDE.md` should still find the rules.
2. Next.js generates a managed instructions block into whichever of these two files it decides owns
   it. The decision logic is roughly "if AGENTS.md exists and CLAUDE.md does not already host the
   block, write to AGENTS.md". So this file is created before the first `next dev` on purpose, to
   keep generated content out of the hand-written `CLAUDE.md`.

   If a Next.js managed block ever appears in `CLAUDE.md`, adding this file is not enough to move
   it. You have to delete the block from `CLAUDE.md` first, otherwise Next keeps writing there.

## The rules in one paragraph, so they are hard to miss

Commits are authored only by `parsa mansouri <parsaxavier@gmail.com>` and never carry a Claude
co-author trailer. Never use em dashes anywhere. Never use pure black or pure white as a design
value. Turkish is the primary language, and Turkish text is pre-cased in the content layer because
`text-transform: uppercase` corrupts it outside Firefox. Never invent a checkable fact about the
business. The full reasoning for each of these is in `CLAUDE.md`.
