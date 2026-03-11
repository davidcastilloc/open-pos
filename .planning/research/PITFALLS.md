# Domain Pitfalls: Configuración del Sistema POS

**Domain:** Point of Sale (POS) - Configuration Module  
**Researched:** 2026-03-11  
**Project:** OpenPOS v1.1 Configuración Inicial del Sistema

---

## Executive Summary

This document catalogs critical, moderate, and minor pitfalls when implementing business configuration, user management, and category features in a POS system. The research is grounded in POS-specific security concerns, database design patterns, and the Venezuelan business context (RIF, local currency).

**Key insight:** Most critical failures in POS configuration modules stem from three sources: (1) inadequate role-based access control leading to internal fraud, (2) poor category hierarchy design causing inventory chaos, and (3) validation gaps in business data that break downstream billing/reporting.

---

## Critical Pitfalls

Mistakes in this category cause security breaches, data loss, or require database rewrites.

### Pitfall 1: Missing Role-Based Access Control (RBAC)

**What goes wrong:** All users get admin privileges or no access control at all. Employee theft and unauthorized discounts go undetected.

**Why it happens:** 
- Treating user management as "just CRUD" without security design
- Hardcoding role checks instead of a reusable permission system
- Over-reliance on UI hiding instead of backend enforcement

**Consequences:**
- Employee can issue unauthorized discounts (major shrinkage source)
- Deletion of critical data by non-admin users
- No audit trail for sensitive operations
- Inability to meet basic compliance for fiscal systems

**Prevention:**
- Implement a permission matrix: define granular permissions (e.g., `users.create`, `users.delete`, `config.write`, `reports.view`, `sales.void`)
- Assign permissions to roles, not directly to users (future-proofs adding new roles)
- Enforce permissions at the API/repository layer, not just UI
- Log all sensitive operations with user ID, timestamp, and action

**Detection:**
- Query: `SELECT * FROM audit_log WHERE action IN ('delete', 'update_role', 'config_change') AND user_id NOT IN (SELECT id FROM users WHERE role = 'admin')`
- Set up alerts for bulk deletions or role changes

**Sources:**
- [Volanté Systems: Foodservice POS Access Mistakes](https://www.volantesystems.com/blog/foodservice-pos-access-mistakes-that-hurt-your-bottom-line/) — HIGH (industry-specific)
- [POS Nation: 6 Ways to Identify Employee Theft Using Your POS](https://www.posnation.com/blog/3-ways-your-pos-helps) — MEDIUM (POS vendor blog)

---

### Pitfall 2: Categories Without Hierarchy (Flat Structure)

**What goes wrong:** All categories are flat. Products that logically belong in subcategories get lumped together or duplicated.

**Why it happens:**
- Designing categories as simple `id, name, description` without `parent_id`
- Assuming "flat is simpler" without considering inventory reporting needs
- No consideration for future scalability

**Consequences:**
- Reports become useless ("All products in one category")
- Users create duplicate categories ("Bebidas", "Bebidas-", "Bebidas ")
- Cannot filter by category tree (e.g., "all drinks" vs "all sodas")
- Reorganization requires migrating every product

**Prevention:**
- Add `parent_id` nullable field with self-referential FK
- Implement recursive CTEs for tree queries
- Create UI for drag-and-drop reordering
- Add unique constraint on `(tenant_id, name, parent_id)` to prevent duplicates at same level

**Database schema fix:**
```sql
-- In categories table, add:
parent_id TEXT REFERENCES categories(id),
level INTEGER GENERATED ALWAYS AS (
  CASE WHEN parent_id IS NULL THEN 0 
  ELSE (SELECT level FROM categories c2 WHERE c2.id = categories.parent_id) + 1 
END) STORED
```

**Sources:**
- [DotActiv: 5 Mistakes to Avoid When Setting Up Your Category Hierarchy](https://dotactiv.com/blog/category-hierarchy-mistakes) — HIGH (category design best practices)
- [Start With Data: Top 5 Product Taxonomy Mistakes](https://startwithdata.co.uk/insight/top-5-product-taxonomy-mistakes-and-how-to-avoid-them/) — HIGH (ecommerce taxonomy)

---

### Pitfall 3: RIF/ Business Data Not Validated for Venezuelan Context

**What goes wrong:** Invalid RIF format accepted. Business data missing or malformed breaks fiscal reporting and future invoicing.

**Why it happens:**
- Treating business name/address as free-text without validation rules
- No RIF format enforcement (10-digit format: Letra + 8 dígitos + dígito verificador)
- No consideration for SENIAT integration requirements

**Consequences:**
- Generated invoices have invalid RIF → rejection by tax authority
- Cannot participate in government billing systems
- Duplicate business entries due to lack of uniqueness constraint

**Prevention:**
- Validate RIF format: `/^[JVDECJP]-[0-9]{8}-[0-9]$/` (for jurídico)
- Store RIF with hyphens normalized for consistency
- Add uniqueness constraint on RIF at database level
- Make critical fields (business name, RIF) required before allowing sales

**RIF format reference:**
- J: Jurídico (companies)
- V: Natural (individuals)
- D: Domínguez
- E: Extranjero
- C: Comunal

**Sources:**
- [Wikipedia: Registro Único de Información Fiscal](https://es.wikipedia.org/wiki/Registro_%C3%9Anico_de_Informaci%C3%B3n_Fiscal) — HIGH (official format reference)
- [SENIAT Venezuela](https://portal.seniat.gob.ve/) — HIGH (official authority)

---

### Pitfall 4: Deleting Categories With Products

**What goes wrong:** Deleting a category leaves products with `category_id` pointing to non-existent record (orphaned data).

**Why it happens:**
- No foreign key constraint with `ON DELETE SET NULL` or `ON DELETE RESTRICT`
- No "are you sure" workflow for non-empty categories
- UI allows deletion without checking product count

**Consequences:**
- Reports crash or show null category names
- Products become "uncategorized" without user intent
- Data integrity corruption

**Prevention:**
- Add FK with `ON DELETE SET NULL` in schema
- In UI: show product count before deletion, require confirmation
- Alternative: soft-delete (`is_active = false`) instead of hard delete
- Create a default "Sin Categoría" category that cannot be deleted

**Sources:**
- [General database design best practices] — HIGH (common anti-pattern)

---

## Moderate Pitfalls

Mistakes that cause operational friction, reporting issues, or require refactoring.

### Pitfall 5: User Passwords Stored Insecurely

**What goes wrong:** Passwords stored as plain text or weak hashes. System vulnerable to credential theft.

**Why it happens:**
- "It's just internal" mindset
- Using MD5 or SHA1 (fast hashes, easy to crack)
- No password policy enforcement

**Consequences:**
- If database is compromised, all employee credentials exposed
- Cannot securely implement future features (password reset)
- Liability for data breaches

**Prevention:**
- Use bcrypt or Argon2 for password hashing
- Never store plain text passwords
- Add password policy: minimum length, require change on first login
- Implement salt per user (bcrypt does this automatically)

**Code example:**
```typescript
// DON'T
const hash = md5(password); // VERY BAD

// DO
import { hash, verify } from '@node-rs/argon2';
const passwordHash = await hash(password);
const isValid = await verify(passwordHash, password);
```

**Sources:**
- [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) — HIGH (authoritative)

---

### Pitfall 6: No Audit Trail for Configuration Changes

**What goes wrong:** Cannot trace who changed business settings. Disputes or compliance issues cannot be resolved.

**Why it happens:**
- Treating config as "just another table"
- No created_by/updated_by tracking
- Overwriting values without history

**Consequences:**
- Cannot investigate "who changed the business name?"
- No rollback capability for accidental changes
- Compliance failure for fiscal systems

**Prevention:**
- Add audit log table: `config_changes (id, config_key, old_value, new_value, user_id, timestamp)`
- Use triggers or application-level logging for all config writes
- Retain at least 30 days of history

**Sources:**
- [General IT audit best practices] — HIGH (industry standard)

---

### Pitfall 7: Category Name Case/Whitespace Inconsistency

**What goes wrong:** "Bebidas", "bebidas ", "BEBIDAS" treated as different categories. Duplicates proliferate.

**Why it happens:**
- No normalization on input
- No unique constraint considering normalization

**Consequences:**
- Users create duplicate categories unknowingly
- Filtering/search becomes unreliable
- Reports split by case show incorrect totals

**Prevention:**
- Normalize on save: `name.trim().toLowerCase()` for comparison
- Store original display name separately
- Use unique constraint on normalized name + parent_id

**Sources:**
- [Data normalization best practices] — HIGH (common data quality issue)

---

### Pitfall 8: No Way to Disable Users (Hard Delete Only)

**What goes wrong:** Cannot deactivate users—only delete. Historical records lose context.

**Why it happens:**
- No `is_active` field on users table
- Only implementing hard delete

**Consequences:**
- Cannot disable a terminated employee's access
- Sales reports show "unknown user" for past transactions
- GDPR/compliance issues (should not delete user data)

**Prevention:**
- Add `is_active` boolean column (already present in current schema ✓)
- Use soft-delete pattern for all entities
- Filter inactive users in authentication but keep in reports

**Note:** Current schema already has `isActive` field — ensure it's used in queries.

**Sources:**
- [General data retention best practices] — HIGH

---

## Minor Pitfalls

 UX issues or technical debt that slow down users.

### Pitfall 9: Overcomplicated Role Names

**What goes wrong:** Users confused by role names like "super_admin", "administrator", "root", "owner".

**Why it happens:**
- Not aligning role names with business language
- Copying patterns from other systems without localization

**Consequences:**
- Support tickets: "Which role should I use?"
- Wrong permissions assigned due to confusion
- Training time increases

**Prevention:**
- Use clear, Spanish names aligned with Venezuelan SMB context:
  - `admin`: Administrador (full access)
  - `manager`: Gerente (supervisión, reportes, sin configuración)
  - `cashier`: Cajero (solo ventas)
- Document each role's permissions in the UI

**Sources:**
- [User role best practices for SMB] — MEDIUM

---

### Pitfall 10: No Default Category on Setup

**What goes wrong:** Products created without category selection fail silently or show "null".

**Why it happens:**
- Category is optional in DB but not in business logic
- No default fallback in queries

**Consequences:**
- Products appear with empty category in reports
- UI shows "Sin categoría" inconsistently

**Prevention:**
- Create a "General" default category on first run
- Use COALESCE in queries: `COALESCE(c.name, 'Sin categoría')`
- Make category required in product form (or default to "General")

---

### Pitfall 11: Business Config Not Loaded on App Start

**What goes wrong:** App shows placeholder data or "undefined" until user manually loads config.

**Why it happens:**
- No startup check for required config
- Async loading not awaited

**Consequences:**
- Poor first impression
- Sales may proceed without business name on receipt

**Prevention:**
- Block POS access until required config is complete
- Show "Configuración requerida" wizard if business data missing
- Cache config in memory after first load

---

## Phase-Specific Warnings

| Phase Topic | Likely Pitfall | Mitigation |
|-------------|---------------|------------|
| **CONFIG-01: Datos del negocio** | RIF format not validated | Add regex validation + Venezuelan format guide |
| **CONFIG-02: Gestión de usuarios** | No RBAC, all-access users | Implement permission matrix before UI |
| **CONFIG-03: Roles y permisos** | Role creep (too many roles) | Start with 3 roles: admin, manager, cashier |
| **CONFIG-04: Gestión de categorías** | Flat hierarchy, delete orphans | Add parent_id + soft-delete + default category |

---

## Venezuela-Specific Considerations

### RIF Validation

The Venezuelan RIF (Registro de Información Fiscal) has specific rules:

| Type | Format | Example |
|------|--------|---------|
| Natural | V-XXXXXXXX-X | V-12345678-9 |
| Jurídico | J-XXXXXXXX-X | J-12345678-9 |
| Jurídico público | J-XXXXXXXX-X | Same format |
| Extranjero | E-XXXXXXXX-X | E-12345678-9 |
| Comunal | C-XXXXXXXX-X | C-12345678-9 |

**Validation regex:** `/^[VJDEC]-[0-9]{8}-[0-9]$/`

### Currency

Venezuela uses multiple currencies. The config system should support:
- Primary: Bolívar (VES/BS)
- Secondary: USD (common for pricing)
- Consider exchange rate storage (already in schema as `exchangeRates`)

---

## Recommendations for v1.1 Roadmap

### Phase 1: Data Foundation
1. Add `parent_id` to categories table
2. Add RIF validation utility
3. Implement bcrypt password hashing
4. Create audit log table

### Phase 2: Core Configuration
1. Business data form with validation
2. User CRUD with role assignment
3. Permission matrix implementation

### Phase 3: Category Management
1. Hierarchical category tree UI
2. Drag-and-drop reordering
3. Product count warning on delete

### Phase 4: Security & Audit
1. Permission enforcement at API layer
2. Audit trail for config changes
3. Session management (login/logout)

---

## Sources

| Source | Confidence | Relevance |
|--------|------------|-----------|
| [Volanté Systems: POS Access Mistakes](https://www.volantesystems.com/blog/foodservice-pos-access-mistakes-that-hurt-your-bottom-line/) | HIGH | Security/user management |
| [POS Nation: Employee Theft Detection](https://www.posnation.com/blog/3-ways-your-pos-helps) | MEDIUM | Security/audit |
| [DotActiv: Category Hierarchy Mistakes](https://dotactiv.com/blog/category-hierarchy-mistakes) | HIGH | Category design |
| [Start With Data: Taxonomy Mistakes](https://startwithdata.co.uk/insight/top-5-product-taxonomy-mistakes-and-how-to-avoid-them/) | HIGH | Taxonomy patterns |
| [Wikipedia: RIF Venezuela](https://es.wikipedia.org/wiki/Registro_%C3%9Anico_de_Informaci%C3%B3n_Fiscal) | HIGH | RIF format reference |
| [OWASP Password Storage](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) | HIGH | Security |

---

*Document generated for OpenPOS v1.1 milestone planning. Last updated: 2026-03-11*
