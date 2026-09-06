<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Blog writing

Gordon prefers functional, conversational technical posts. Explain the problem, the relevant technology, and what the reader can do with the information. Keep enough context and explanation to sound natural without turning the post into a story or making it blunt. His direct editorial feedback takes precedence over patterns in older posts and generic advice about engagement.

## Titles, summaries, and tone

- Use descriptive titles that name the subject and task. Prefer `Excluding Shunt data from Time Machine backups` to `When 154 GB Looked Like 19 TB to Time Machine`. `Getting sudo to use Touch ID on macOS` is already a useful, functional title.
- Make the summary describe the content and reader payoff. Avoid teasers, curiosity gaps, exaggerated claims, and promises that the evidence cannot support.
- State the useful answer early. Avoid suspense such as "the missing clue", hype such as "spectacular failure", and dramatic headings such as "The second first backup".
- Keep first-person context when it explains what Gordon uses, observed, or chose. Omit scene-setting, staged revelations, and a chronological account of every investigation step unless that sequence helps the reader reproduce or understand the result.
- Use plain words, contractions, and varied sentence lengths. Connect related thoughts into readable paragraphs; don't replace hype with clipped instructions or a run of punchy fragments.

## Structure and technical explanations

- Choose the shortest structure that covers the subject properly. A configuration note may only need setup, testing, and rollback. A troubleshooting post may need an explanation of the mechanism before the commands. There is no required section count or word count.
- Introduce relevant tools and their role near the start. When mentioning a project such as Shunt, link its existing project page on this blog at the first useful mention.
- Verify the implementation in the relevant repository before naming the technology or explaining a cause. Distinguish the product, runtime, filesystem feature, and data layout when those differences affect the explanation. For example, Shunt's APFS copy-on-write data-volume clones and the container runtime's sparse disk images are separate storage mechanisms.
- Explain what each measurement covers, including its path, units, and limits. A directory's apparent size is not a measured backup size; measurements of container disks do not establish the size or behaviour of host data-volume clones.
- Separate observations from possible explanations. A similar upstream issue can support an explanation without proving the exact cause of Gordon's incident. Don't invent a contribution breakdown, completed result, or first-hand experience.
- Put commands, expected output, caveats, and verification beside the claim or action they support. Cover the actions promised by the post: a post about excluding both runtime data and data volumes needs guidance for both.
- End on the concrete result, remaining technical limitation, or useful check. Avoid a grand lesson, repeated recap, motivational ending, or commentary about producing and reviewing the post.

## Editing and checking posts

- When a technical correction changes the premise, review the whole post. Update the title, summary, introduction, headings, measurements, commands, related advice, and conclusion wherever affected. Patching the paragraph that prompted the feedback is not enough.
- Preserve the original dates when editing or promoting drafts unless Gordon explicitly requests a date change. Keep dated folders consistent with frontmatter. Follow the queue rules in `content/blog-drafts/README.md` for queued posts.
- Use `content:gordons-voice` and run the `humanizer` skill's review process after prose changes. Re-read the complete result for repetition, artificial drama, choppy rhythm, and unsupported claims.
- Verify internal link targets, MDX compilation, and the rendered post route. Keep existing commands, measurements, and links accurate through the rewrite; describe incomplete verification honestly.

## Calibration posts

Use these approved rewrites as examples of tone, detail, and evidence handling, without copying their structure into every post:

- [Excluding Shunt data from Time Machine backups](content/blog/2026-09-02/excluding-apple-container-data-from-time-machine-backups.mdx)
- [Getting sudo to use Touch ID on macOS](content/blog/2026-09-04/getting-sudo-to-use-touch-id-on-macos.mdx)
