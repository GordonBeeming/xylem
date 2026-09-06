import { SiteRail, SiteRailBrief } from "./SiteRail";
import styles from "./PageShell.module.css";

/**
 * The bordered well every content page sits in.
 *
 * `rail` picks how the rail is placed: beside the content by default, or
 * `"under"` as a reduced strip for pages whose own layout already uses the full
 * width, or `false` for pages a rail would only get in the way of.
 */
export function PageShell({
  children,
  rail = true,
}: {
  children: React.ReactNode;
  rail?: boolean | "under";
}) {
  return (
    <div className={styles.wrap}>
      <div className={styles.well}>
        {rail === true ? (
          <div className={styles.shell}>
            <div className={styles.main}>{children}</div>
            <SiteRail />
          </div>
        ) : (
          <>
            <div className={styles.main}>{children}</div>
            {rail === "under" && (
              <div className={styles.under}>
                <SiteRailBrief />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
