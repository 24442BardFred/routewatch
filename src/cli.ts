#!/usr/bin/env node
import { Command } from 'commander';
import { createSnapshot, listSnapshots, loadSnapshot, deleteSnapshot } from './snapshot';
import { diffSnapshots } from './diff';
import { generateReport } from './report';
import { fetchRoutes } from './fetch';

const program = new Command();

program
  .name('routewatch')
  .description('Monitor and diff REST API route changes across deployments')
  .version('0.1.0');

program
  .command('snapshot <url>')
  .description('Fetch and save a snapshot of routes from a given API URL')
  .option('-n, --name <name>', 'snapshot name/label', `snapshot-${Date.now()}`)
  .action(async (url: string, options: { name: string }) => {
    try {
      console.log(`Fetching routes from ${url}...`);
      const routes = await fetchRoutes(url);
      const snapshot = await createSnapshot(options.name, url, routes);
      console.log(`Snapshot saved: ${snapshot.id} (${routes.length} routes)`);
    } catch (err) {
      console.error('Error creating snapshot:', (err as Error).message);
      process.exit(1);
    }
  });

program
  .command('diff <snapshot1> <snapshot2>')
  .description('Diff two snapshots by their IDs')
  .option('-f, --format <format>', 'output format: text | markdown | json', 'text')
  .action(async (id1: string, id2: string, options: { format: string }) => {
    try {
      const s1 = await loadSnapshot(id1);
      const s2 = await loadSnapshot(id2);
      if (!s1 || !s2) {
        console.error('One or both snapshots not found.');
        process.exit(1);
      }
      const diff = diffSnapshots(s1, s2);
      const report = generateReport(diff, options.format as 'text' | 'markdown' | 'json');
      console.log(report);
    } catch (err) {
      console.error('Error diffing snapshots:', (err as Error).message);
      process.exit(1);
    }
  });

program
  .command('list')
  .description('List all saved snapshots')
  .action(async () => {
    try {
      const snapshots = await listSnapshots();
      if (snapshots.length === 0) {
        console.log('No snapshots found.');
        return;
      }
      console.log('Saved snapshots:');
      snapshots.forEach((s) => {
        console.log(`  [${s.id}] ${s.label} — ${s.url} (${s.routes.length} routes) @ ${s.createdAt}`);
      });
    } catch (err) {
      console.error('Error listing snapshots:', (err as Error).message);
      process.exit(1);
    }
  });

program
  .command('delete <id>')
  .description('Delete a saved snapshot by its ID')
  .action(async (id: string) => {
    try {
      const deleted = await deleteSnapshot(id);
      if (!deleted) {
        console.error(`Snapshot not found: ${id}`);
        process.exit(1);
      }
      console.log(`Snapshot deleted: ${id}`);
    } catch (err) {
      console.error('Error deleting snapshot:', (err as Error).message);
      process.exit(1);
    }
  });

program.parse(process.argv);
