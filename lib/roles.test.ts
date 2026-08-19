// Run: npm test
//
// The role matrix, stated as the requirement was stated: an Analyst may create
// a company and add a component, and may not manage anything or see the logs.
// Role is chosen by entry URL and carries no database permission, so this
// matrix IS the access control -- a silent regression here is not caught by
// anything else in the suite.

import assert from "node:assert/strict";
import { test } from "vitest";
import { ROLES, roleAtLeast, rolePermissions, type Role } from "./schema";

const permissionsFor = (role: Role) => rolePermissions(role);

test("Public is read-only", () => {
  const can = permissionsFor("Public");
  assert.deepEqual(can, {
    canCreateCompany: false,
    canAddComponent: false,
    canEdit: false,
    canDelete: false,
    canExport: false,
    canAdmin: false
  });
});

test("Analyst can create a company and add a component, nothing more", () => {
  const can = permissionsFor("Analyst");
  assert.equal(can.canCreateCompany, true);
  assert.equal(can.canAddComponent, true);
  // The "cannot manage" half of the requirement.
  assert.equal(can.canEdit, false);
  assert.equal(can.canDelete, false);
  assert.equal(can.canExport, false);
  assert.equal(can.canAdmin, false);
});

test("Admin can do everything", () => {
  assert.ok(Object.values(permissionsFor("Admin")).every(Boolean));
});

// Every Admin-only page wraps itself in <RequireRole min="Admin">, including
// /audit and /admin. This is the predicate that gates them and the sidebar.
test("only Admin clears an Admin gate", () => {
  assert.equal(roleAtLeast("Public", "Admin"), false);
  assert.equal(roleAtLeast("Analyst", "Admin"), false);
  assert.equal(roleAtLeast("Admin", "Admin"), true);
});

test("Analyst clears an Analyst gate but Public does not", () => {
  assert.equal(roleAtLeast("Public", "Analyst"), false);
  assert.equal(roleAtLeast("Analyst", "Analyst"), true);
  assert.equal(roleAtLeast("Admin", "Analyst"), true);
});

test("every role clears a Public gate", () => {
  for (const role of ROLES) assert.equal(roleAtLeast(role, "Public"), true);
});

test("the role set is exactly the three routed roles", () => {
  assert.deepEqual(ROLES, ["Public", "Analyst", "Admin"]);
});
