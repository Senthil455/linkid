import assert from "node:assert/strict";
import { mock, test, before } from "node:test";

type DeleteManyArgs = {
    where: {
        status?: { in?: string[] };
        updatedAt?: { lt: Date };
    };
};

let captured: DeleteManyArgs | null = null;
let deletedCount = 0;

mock.module("@/lib/prisma", {
    defaultExport: {
        job: {
            deleteMany: async (args: DeleteManyArgs) => {
                captured = args;
                return { count: deletedCount };
            },
        },
    },
    namedExports: {
        prisma: {
            job: {
                deleteMany: async (args: DeleteManyArgs) => {
                    captured = args;
                    return { count: deletedCount };
                },
            },
        },
    },
});

let pruneOldJobs: (now?: Date) => Promise<{ count: number }>;

before(async () => {
    const mod = await import("@/lib/jobs");
    pruneOldJobs = mod.pruneOldJobs;
});

test("deletes terminal jobs older than the retention window", async () => {
    captured = null;
    deletedCount = 12;

    const now = new Date("2026-10-20T12:00:00.000Z");
    const result = await pruneOldJobs(now);

    assert.deepEqual(result, { count: 12 });
    assert.ok(captured);
    assert.deepEqual(captured.where.status?.in, ["COMPLETED", "FAILED"]);
    assert.equal(
        captured.where.updatedAt?.lt.toISOString(),
        new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
    );
});

test("reports zero when there is nothing to prune", async () => {
    captured = null;
    deletedCount = 0;

    const result = await pruneOldJobs(new Date("2026-10-20T12:00:00.000Z"));

    assert.deepEqual(result, { count: 0 });
    assert.ok(captured);
});
