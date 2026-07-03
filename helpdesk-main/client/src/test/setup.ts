import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";
import React from "react";

// Mock framer-motion since its animation wrappers are not needed in component tests
vi.mock("framer-motion", () => {
  const motion = {
    div: React.forwardRef(({ children, initial, animate, exit, transition, ...props }: any, ref: any) => {
      return React.createElement("div", { ref, ...props }, children);
    }),
  };
  return {
    motion,
    AnimatePresence: ({ children }: any) => children,
  };
});

// Mock Better Auth client session
vi.mock("../lib/auth-client", () => {
  return {
    useSession: () => ({
      data: {
        user: {
          id: "test-user-id",
          name: "Alice Admin",
          email: "alice@example.com",
          role: "admin",
        },
      },
      isPending: false,
    }),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  };
});

vi.mock("@/lib/auth-client", () => {
  return {
    useSession: () => ({
      data: {
        user: {
          id: "test-user-id",
          name: "Alice Admin",
          email: "alice@example.com",
          role: "admin",
        },
      },
      isPending: false,
    }),
    signIn: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  };
});
