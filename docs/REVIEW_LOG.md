# Repository review — 2026-10-11

Changes are prepared locally on `dev` for the maintainer to review, commit, and push.
No source commits, merges, source pushes, deployments, or store submissions were made.
The GitHub PR closures and remote bot-branch deletions below were explicitly requested.

## Product, branding, and content

- Replaced every generated brand export with artwork derived from the untouched `web/public/new-logo.png`: UI marks, theme aliases, browser/Apple icons, social card, mobile launcher, adaptive masks, monochrome notification artwork, and splash.
- Rebuilt the landing page with Fraunces/DM Sans, ocean colors, a split hero, live trip listings, responsive sections, focus styles, and reduced-motion support.
- Labeled the destination map and phone mockups as inspiration/previews, removed unsupported availability claims, and made destination markers keyboard/touch accessible.
- Added a non-mutating check of all 28 generated exports against the source artwork; CI runs it after installing web dependencies. Fixed the FAQ’s outdated Lucide icon name.

## Workflows and contributor guidance

- All existing Node setup steps now use the repository pin, Node 24.18.0; pnpm remains 11.6.0.
- Web CI checks the environment template after toolchain setup, verifies its log runner, checks types/tests where configured, and runs a production build before image publication.
- Check output is retained in `ci-logs/*.log`, summarized in GitHub Actions, and uploaded as `web-check-logs` for 14 days, including failed checks. The runner preserves failures and redacts known secret environment values; tests cover failure propagation and secrets split across output chunks. Logs are ignored locally.
- Development and contributor PRs target `dev`. Existing image publication remains restricted to pushes to `dev`; store submissions remain manual from `dev` through the production environment. Release tags must be reachable from `dev`.
- Scheduled Dependabot version PRs are paused locally with limit 0 and explicit `dev` targets. This takes effect after the maintainer pushes. GitHub security-alert/security-update settings were not changed; manual dependency and security-alert triage is still required.
- Corrected documentation that described `main`, automatic `latest` images, obsolete EAS delivery, and inconsistent environment-template rules. Non-secret localhost defaults are allowed; secrets stay empty in the committed template.

## GitHub cleanup

- Confirmed the default and working branch is `dev`.
- Closed 9 bot PRs without merging: [#20](https://github.com/usmhic/freesolo/pull/20), [#16](https://github.com/usmhic/freesolo/pull/16), [#13](https://github.com/usmhic/freesolo/pull/13), [#9](https://github.com/usmhic/freesolo/pull/9), [#6](https://github.com/usmhic/freesolo/pull/6), [#5](https://github.com/usmhic/freesolo/pull/5), [#4](https://github.com/usmhic/freesolo/pull/4), [#3](https://github.com/usmhic/freesolo/pull/3), [#2](https://github.com/usmhic/freesolo/pull/2).
- Removed 10 remote bot branches, including branches GitHub automatically deleted after PR closure. Verified that only `dev` remains on the remote.
- Before cleanup, fetched bot branch tips and created a verified local recovery bundle at `.cache/repository-audit/bot-branches-2026-10-11.bundle`. JSON snapshots and cleanup results are beside it; these local artifacts are ignored by Git.
- Recovery: inspect with `git bundle list-heads .cache/repository-audit/bot-branches-2026-10-11.bundle`; fetch an explicitly selected archived ref into a new recovery branch if needed.

| Removed branch | Archived tip |
| --- | --- |
| `claude/app-group-travel-positioning-6f06up` | `5f61f2eb05fc4aa9ae766ac9c2d0a49d78c987f8` |
| `dependabot/github_actions/actions/checkout-7` | `4979be86ae2d4fe88d6e5b46bc926ea75333a402` |
| `dependabot/github_actions/actions/setup-node-7` | `3f195c0fe82189367b89be6132901235fec8849b` |
| `dependabot/github_actions/actions/upload-artifact-7` | `15640ad9b9929d5a6ddcb2af4c240bd5ced31062` |
| `dependabot/github_actions/docker/build-push-action-7` | `4b18fade9168b710f5fcb8725c825b3e8c6023fe` |
| `dependabot/github_actions/pnpm/action-setup-6` | `91b9f47af3f07d8eec6e9a2155cdf42a6332168b` |
| `dependabot/maven/api/maven-minor-217af0cac6` | `96b1cfa2a465ff7a493efaec00ccd6832d04c8bf` |
| `dependabot/npm_and_yarn/mobile/mobile-minor-33f80c1e48` | `501489d1d91f177e77744b6c11ca68615e12312a` |
| `dependabot/npm_and_yarn/mobile/react-native-gesture-handler-3.1.0` | `2b4177c61861af8b32c92a78055ff76501951aac` |
| `dependabot/npm_and_yarn/web/web-minor-11b49edbc3` | `1be1b309f0362c3790b8a2904ac5ab82a3954895` |

## Validation

- Production Next.js build passed using the pinned Node version.
- Web TypeScript and ESLint checks passed.
- CI log-runner tests passed (successful check, failing check, output redaction, and summaries).
- All workflow files passed Actionlint 1.7.7. Environment-template validation passed.
- Tracked Markdown/MDX relative-file links were checked: 32 links, no missing targets (URL fragments and live external destinations excluded).
- Browser checks cover 320, 375, 768, 1024, and 1440 px: no document overflow, one primary heading, no nested main/link elements, and no broken images. All 28 brand exports match the new master.
- Local check logs are under `ci-logs/`. Browser screenshots and the complete responsive run are under the Skaddosh checkout’s `.cache/landing-qa/` and `ci-logs/responsive.log`.

## Review limits and follow-ups

This review covered public landing content, branding exports, contributor/setup/release guidance, relative documentation links, dependency-bot cleanup, and workflow configuration. It is not a complete security or legal audit of all application code.

- Local backend services were not running during the landing preview. Authenticated journeys, receipt processing, database migrations, payments, email, and external storage were not exercised end to end. The Skaddosh UI preview explicitly disabled startup migrations; production migration behavior was not changed.
- Docker/container builds and signed Android/iOS delivery were not run locally; Docker and Apple signing infrastructure were unavailable. The updated hosted workflows have not run because source changes remain local.
- Expenn’s existing Next.js middleware naming emits a migration deprecation warning. Existing Windows environment wrappers also emit Node’s shell-argument deprecation warning. Neither warning prevented the builds.
- Privacy/security policy statements about hosting, encryption at rest, retention, and support response times need confirmation against the actual operator’s deployment; infrastructure guarantees were not inferred from UI code.

## Addendum — 2026-11-22

- Rebased onto `dev` after #36 (play missions, translations, grouped env template); no conflicts.
- `scripts/check-brand.mjs` now compares text exports independent of line endings, so it passes on
  Windows checkouts that convert `site.webmanifest` to CRLF.
- Moved this log from the repository root to `docs/`.
