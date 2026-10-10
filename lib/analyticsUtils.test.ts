import { test } from "node:test";
import assert from "node:assert/strict";
import { detectDeviceType } from "@/lib/analyticsUtils";

// Chromium's Android tablet UAs omit Mobile, including after UA reduction.
// https://www.chromium.org/updates/ua-reduction/
const reducedTablet = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36";
const reducedPhone = "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36";

test("detectDeviceType recognizes Chrome Android tablets without a Tablet token", () => {
    assert.strictEqual(detectDeviceType(reducedTablet), "tablet");
    assert.strictEqual(detectDeviceType(reducedTablet.toUpperCase()), "tablet");
    assert.strictEqual(detectDeviceType("Mozilla/5.0 (Linux; Android 9; SM-T810) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.0.0 Safari/537.36"), "tablet");
});

test("detectDeviceType preserves Android phone and iPhone classification", () => {
    assert.strictEqual(detectDeviceType(reducedPhone), "mobile");
    assert.strictEqual(detectDeviceType("Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"), "mobile");
});

test("detectDeviceType gives explicit tablet identifiers precedence over Mobile", () => {
    assert.strictEqual(detectDeviceType("Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Safari/604.1"), "tablet");
    assert.strictEqual(detectDeviceType("Mozilla/5.0 (Android; Tablet) Mobile Safari/537.36"), "tablet");
});

test("detectDeviceType preserves desktop and missing user-agent behavior", () => {
    assert.strictEqual(detectDeviceType("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"), "desktop");
    assert.strictEqual(detectDeviceType(""), "unknown");
    assert.strictEqual(detectDeviceType(null), "unknown");
    assert.strictEqual(detectDeviceType(undefined), "unknown");
});
