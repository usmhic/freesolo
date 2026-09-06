# Package Naming

This repository follows the shared usmhic package-naming policy in `STANDARDS.md`.
Names below are public identifiers and should be treated as compatibility surfaces.

## Existing names

| Surface | Public name | Rule |
| --- | --- | --- |
| Repository | `freesolo` | Lowercase product/repository name |
| Java packages | `com.freesolo.api.<domain>` | Reverse-domain root with lowercase domains |
| Maven group | `com.freesolo` | Product-owned Java namespace |
| Maven artifact | `api` | Existing API artifact name |
| Web application | `freesolo-web` | Existing lowercase npm application name |
| Mobile application | `freesolo` | Existing lowercase npm application name |
| Android package | `com.osascloud.freesolo` | Reverse-domain, lowercase identifier |

## Rules for new code

- Keep Java packages lowercase and under `com.freesolo.api`.
- Use the domain name as the next package segment; do not create generic shared packages for domain-owned code.
- Keep Maven coordinates stable. New modules should use `com.freesolo` as their group and a concise lowercase artifact name.
- Keep npm names lowercase; use a product-owned scope only for a future multi-package workspace.
- Do not rename an existing package, artifact, app, or Android identifier without a migration plan and release-note entry.
- Use `usmhic` for repository ownership and source links, not as a replacement for the product namespace.
