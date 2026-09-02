import { SiteRail } from "./SiteRail";
import styles from "./PageShell.module.css";

/**
 * The bordered well plus rail that every content page sits in. Pass
 * `rail={false}` for the few pages the rail would only get in the way of.
 */
export function PageShell({
  children,
  rail = true,
}: {
  children: React.ReactNode;
  rail?: boolean;
}) {
  return (
    <div className={styles.wrap}>
      <div className={styles.well}>
        {rail ? (
          <div className={styles.shell}>
            <div className={styles.main}>{children}</div>
            <SiteRail />
          </div>
        ) : (
          <div className={styles.main}>{children}</div>
        )}
      </div>
    </div>
  );
}
