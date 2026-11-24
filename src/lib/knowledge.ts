/**
 * Knowledge base for the chatbot. It is small enough to go straight into the
 * system prompt, so no embeddings or vector search are needed.
 * Keep every answer short: small local models copy the tone they are given.
 */
export const KNOWLEDGE = `
## The Desync

Q: What is the Desync?
A: A corrupting force that pulls Achrona out of sync. Where it touches, magic drains away and data starts leaking.

Q: Where does the Desync come from?
A: Nobody knows yet. Its influence keeps getting stronger, so we have to fight back.

Q: When did the Desync start affecting Achrona?
A: The first signals appeared about 10 years ago, but it only started harming Achrona around 6 months ago.

Q: Can the Desync be erased?
A: Not yet. The Augmented use advanced technology to trace the source of the Desync. The Purists support their efforts by helping the people who are affected.

Q: Who are the Augmented?
A: A faction that relies on technology. They analyse Desync signals and are searching for its source.

Q: Who are the Purists?
A: A faction that relies on care and community. They help people and places hit by the Desync while the Augmented hunt for its source.

Q: What happens if we don't manage the echoes?
A: The magic in Achrona drains, data keeps leaking, and small glitches grow into critical ones.

## Magic and the state of Achrona

Q: What is the magic level?
A: The percentage of magic left in Achrona. 100% means everything is normal. Every open glitch drains it, and fixing glitches restores it.

Q: What do the states on the dashboard mean?
A: Stable means 80% magic or more. "Desync spreading" means between 50% and 80%. "Critical desync" means below 50%, and every guardian should be on alert.

Q: What should I do when Achrona is critical?
A: Report everything unusual right away, follow your commander's orders, and focus on glitches that are still LEAKED.

## Echoes and glitches

Q: What is an echo?
A: A report from a guardian about something strange they noticed. Every echo has a description and a timestamp.

Q: What is a glitch?
A: A problem in Achrona caused by the Desync. By default, every echo is treated as a glitch.

Q: What is the difference between an echo and a glitch?
A: An echo is a report. A glitch is the problem itself. Several echoes can describe the same glitch.

Q: How do I send an echo?
A: Click "Report echo" on mission control and describe what you noticed.

Q: What do I need to include when sending an echo?
A: A clear description: what you saw, where, and how bad it is. The timestamp is added automatically, and the echo is flagged as a glitch.

Q: What makes a good echo description?
A: Be specific. "Lanterns on the east bridge flicker every few seconds" is better than "something is wrong".

Q: What happens after I send an echo?
A: It shows up as a glitch with status LEAKED. A commander assigns it to a defender, or a defender takes it, and updates move it through the next statuses.

Q: Can I edit an echo?
A: Yes, your own echoes. Commanders can edit and remove all echoes and glitches.

Q: Can I delete a message?
A: Yes, your own messages. Others then see that a message was deleted.

Q: What are the glitch statuses?
A: LEAKED (just reported), ASSESSING (being investigated), CONTAINING (being contained), and FIXED (resolved).

Q: What does LEAKED mean?
A: The glitch was just reported and still has to be investigated.

Q: What does ASSESSING mean?
A: Guardians are investigating how serious the glitch is and what is causing it.

Q: What does CONTAINING mean?
A: Action is being taken to stop the glitch from spreading.

Q: What does FIXED mean?
A: The glitch is resolved and that part of Achrona is back in sync.

Q: Can a fixed glitch come back?
A: Yes. If the same problem shows up again, add an update to the glitch. The assigned defender or a commander can set it back to LEAKED.

## Guardians and roles

Q: What is a guardian?
A: Anyone who protects Achrona from the Desync. Every guardian has a codename and a role.

Q: What is a defender?
A: A guardian who reports echoes, takes on glitches and keeps watch over Achrona.

Q: What is a commander?
A: A guardian in charge of monitoring Achrona. Commanders can also assign glitches to defenders, change the status of any glitch, and change the roles of other guardians.

Q: Can a defender change the status of a glitch?
A: Yes, on a glitch assigned to you. Commanders can change the status of any glitch.

Q: How do I change the status of a glitch?
A: Open the glitch, click "Add update", describe what happened and pick the new status.

Q: How do I assign a glitch to myself?
A: As a defender, open a glitch that nobody has yet and click "Assign to me". You can release it again later.

Q: Who can assign a glitch?
A: Commanders can assign any glitch to a defender. Defenders can take a free glitch themselves.

Q: How do I add an update to a glitch?
A: Open the glitch and click "Add update". Every guardian can do this.

Q: How do I become a commander?
A: A commander can make you one on the Guardians page.

Q: What can I do to help?
A: Report echoes, describe them clearly, and stay vigilant.
`.trim()
