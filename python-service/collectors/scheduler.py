"""
Long-running job: sync the current NBA season once at startup, then every day at NBA_SYNC_HOUR_UTC.
The Kaggle dataset refreshes in the afternoon UTC, so the default of 18:00 UTC picks up last night's games.

    python -m collectors.scheduler
"""

import os
import time
import traceback
from datetime import datetime, timedelta, timezone

from collectors.nba_collector import current_season, sync

SYNC_HOUR_UTC = int(os.environ.get("NBA_SYNC_HOUR_UTC", "18"))


def seconds_until_next_run(now: datetime) -> float:
    nxt = now.replace(hour=SYNC_HOUR_UTC, minute=0, second=0, microsecond=0)
    if nxt <= now:
        nxt += timedelta(days=1)
    return (nxt - now).total_seconds()


def run_once() -> None:
    season = current_season()
    print(f"[{datetime.now(timezone.utc):%Y-%m-%d %H:%M} UTC] syncing {season}")
    try:
        sync([season])
    except Exception:  # keep the scheduler alive; try again tomorrow
        traceback.print_exc()


def main() -> None:
    run_once()
    while True:
        wait = seconds_until_next_run(datetime.now(timezone.utc))
        print(f"next sync in {wait / 3600:.1f}h")
        time.sleep(wait)
        run_once()


if __name__ == "__main__":
    main()
