# Enterprise Car Configuration Platform (ECP) - Working Requirements

## Purpose
This repository is implementing an **Enterprise Car Configuration Platform (ECP)** inspired by systems used by manufacturers such as Tesla, BMW, and Mercedes-Benz.

The platform is intended to let **customers, dealers, and internal sales teams** configure vehicles online while ensuring:
- no invalid combinations
- real-time pricing updates
- market-specific and dealer-specific constraints
- regulatory compliance enforcement
- manufacturing feasibility validation

## Business Context
Automotive manufacturers face:
- thousands of configurable options
- complex interdependencies between features
- country-specific regulations
- dealer-level pricing and incentives
- production line limitations
- order audit and compliance requirements

## Goals
- Prevent invalid configurations in real time
- Support 50,000+ SKUs per model
- Keep rule evaluation latency under 100ms
- Provide ACID-compliant pricing
- Support multi-region operations
- Achieve target availability of 99.99%

## Non-Goals
- Vehicle manufacturing planning system
- Logistics management
- CRM replacement

## Required User Flow
1. Select Model
2. Select Engine
3. Select Transmission
4. Select Trim
5. Select Exterior
6. Select Interior
7. Select Wheels
8. Add Packages
9. Review and Save

## Functional Requirements by Step

### Select Model
- User selects a vehicle model such as Sedan, SUV, or Coupe
- Model selection resets the entire downstream configuration state
- Load model version, option catalog, ruleset version, and pricing version
- Only model-level constraints apply at this stage
- Allowed engines must be filtered by market and dealer

### Select Engine
- Available engines are shown dynamically
- Some engines may be disabled by market rules
- Example rules:
  - If market = California, exclude Diesel
  - If model = Compact, exclude V8
- Engine selection must trigger incremental recalculation:
  - base price update
  - engine price addition
  - incentive recalculation

### Select Transmission
- Transmission options may be auto-disabled or auto-selected
- Example: if Electric, transmission may be auto-selected to Automatic / Direct Drive
- Must evaluate dependency rules, exclusion rules, and forced overrides
- Invalid combinations must be rejected with validation feedback

### Select Trim
- Trim defines a large feature bundle
- Trim impacts may include:
  - default interior
  - default wheels
  - suspension type
  - feature packages
- Example rule: if trim = Sport, include Sport Suspension
- Changing trim may:
  - remove incompatible options
  - auto-include bundled features
  - trigger cascading recalculation
- Enterprise-preferred conflict handling: auto-remove incompatible selections and notify the user

### Select Exterior
- Exterior includes paint, body kit, roof type, and similar options
- Example rules:
  - if trim = Base, exclude Metallic Paint
  - if panoramic roof = true, exclude roof rails
- Exterior logic may depend on trim, market regulations, and factory constraints
- System should re-evaluate only affected rules incrementally

### Select Interior
- Interior includes seat material, seat color, dashboard finish, ambient lighting, etc.
- Example rule: if interior color = Red and trim = Base, configuration is invalid
- If upstream changes invalidate interior choices, system should auto-adjust deterministically or prompt
- Preferred enterprise behavior: deterministic auto-adjustment with notification

### Select Wheels
- Wheel rules may depend on:
  - engine torque
  - suspension type
  - snow chain compatibility
  - regional safety compliance
- Example rules:
  - if wheel size = 21in, exclude snow chains
  - if drivetrain != AWD, exclude off-road wheels

### Add Packages
- Packages are bundles such as Technology, Winter, and Safety
- Example rules:
  - if Winter Package, include Heated Seats and Heated Steering
  - if engine = Electric, exclude Tow Package
- Packages may depend on trim, engine, and region

### Review and Save
- After review, the lifecycle typically splits into two paths:
  - Quote Path: customer exploration stage
  - Order Path: production commitment stage

## Enterprise Platform Capabilities Expected
- centralized rule evaluation
- incremental rule recomputation
- versioned catalog, rules, and pricing
- market-aware and dealer-aware filtering
- auditability and compliance traceability
- manufacturing feasibility checks
- persistent quote and order workflows
- strong pricing consistency and transactional integrity

## Current State of This Repository
The current codebase implements a **UI-focused prototype** of the ECP flow using:
- Next.js 14
- TypeScript
- Zustand for client-side configuration state
- tRPC scaffolding
- mock catalog data for models, engines, trims, wheels, packages, and options

The repository already includes:
- the full multi-step configurator flow
- compatibility-aware selection logic
- cascading resets of downstream selections
- live price recalculation in the client
- review and summary screens
- a preset-based "AI assistant" that recommends canned build presets

## Current Gaps vs Target ECP Vision
The repository does **not yet** implement the full enterprise platform. Missing pieces include:
- real backend persistence for configurations, quotes, and orders
- rule engine abstraction beyond hardcoded client-side logic
- market, country, region, and dealer context
- ACID-compliant pricing service
- audit trail and compliance logs
- manufacturing feasibility validation
- explicit quote path and order path workflows
- scale-oriented architecture for high traffic and very large SKU counts

## Product Interpretation
This repo should be treated as a **front-end prototype / early application layer** for the broader Enterprise Car Configuration Platform, not yet as the final enterprise system.

## Recommended Near-Term Direction
Highest-value next steps are:
1. Introduce explicit domain context: market, region, dealer, customer intent
2. Move validation and pricing rules into a backend service layer
3. Add saveable Quote workflow with persistence and audit metadata
4. Add deterministic auto-adjustment + user notifications for invalidated selections
5. Add versioned catalog / rules / pricing models

## Practical Guiding Principle
Every new feature should be evaluated against this question:

**Does it move the app from a client-side configurator demo toward a rule-driven, auditable, enterprise configuration platform?**