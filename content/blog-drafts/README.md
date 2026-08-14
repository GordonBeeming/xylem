# Blog drafts

Keep each unfinished post in its own folder:

```text
content/blog-drafts/<slug>/
├── post.mdx
└── images/        # optional
```

Use a lowercase slug made from letters, numbers, and hyphens. Put the post in `post.mdx`, and keep any images it uses directly inside the optional `images` folder. Local image references can use `images/filename.png` or `./images/filename.png` while the post is still a draft.

Files in this folder are tracked in Git, but the site does not load or publish them. The publication routine makes a post public by moving it into the dated `content/blog` structure and updating its date and image references. Do not move a queued draft by hand.
