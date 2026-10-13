-- Enforce immutability rules from CLAUDE.md at the database level, so no code path can bypass them.

-- consent_snapshots: no UPDATE or DELETE, ever.
CREATE FUNCTION forbid_change() RETURNS trigger AS $$
BEGIN
  RAISE EXCEPTION '% on % is not allowed (immutable table)', TG_OP, TG_TABLE_NAME;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER consent_snapshots_immutable
  BEFORE UPDATE OR DELETE ON consent_snapshots
  FOR EACH ROW EXECUTE FUNCTION forbid_change();
--> statement-breakpoint
-- consent_versions: wording is fixed once written; only active / counsel_approved_at may change.
CREATE FUNCTION consent_versions_guard() RETURNS trigger AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    RAISE EXCEPTION 'DELETE on consent_versions is not allowed';
  END IF;
  IF NEW.text IS DISTINCT FROM OLD.text
     OR NEW.line IS DISTINCT FROM OLD.line
     OR NEW.language IS DISTINCT FROM OLD.language
     OR NEW.version IS DISTINCT FROM OLD.version THEN
    RAISE EXCEPTION 'consent_versions wording is immutable; insert a new version instead';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
--> statement-breakpoint
CREATE TRIGGER consent_versions_immutable
  BEFORE UPDATE OR DELETE ON consent_versions
  FOR EACH ROW EXECUTE FUNCTION consent_versions_guard();
--> statement-breakpoint
-- audit_log: append-only.
CREATE TRIGGER audit_log_append_only
  BEFORE UPDATE OR DELETE ON audit_log
  FOR EACH ROW EXECUTE FUNCTION forbid_change();
