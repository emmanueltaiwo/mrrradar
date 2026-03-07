import { cronJobs } from 'convex/server';
import { internal } from './_generated/api';

const crons = cronJobs();

crons.daily(
  'sync-startups-midnight',
  { hourUTC: 0, minuteUTC: 0 },
  internal.startups.syncStartupsFromTrustMRR,
  {},
);

export default crons;
