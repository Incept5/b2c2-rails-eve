---
type: "story"
story_id: "STORY_06_PaymentMethodsEdgesDataModel"
epic_name: "CoreDatabaseInfrastructure"
created_date: "2025-02-06"
author: "Eve - AI Software Architect"
status: "backlog"
---

# Story 6: Payment Methods (Edges) Data Model

## Title
Implement Payment Methods as Graph Edges with Scheme Inheritance and Overrides

## Description
**As a** system administrator  
**I want** to define payment methods as directed edges connecting asset nodes  
**So that** the graph represents all possible payment routes with inherited scheme properties and method-specific overrides for fees, limits, and operational constraints

## Acceptance Criteria

1. **Given** a system administrator needs to create a payment method, **when** they specify source node, destination node, and payment scheme, **then** the system creates a directed edge with inherited scheme properties and validates node compatibility

2. **Given** a payment method inherits from a payment scheme, **when** it is created, **then** it automatically inherits operating hours, fees, limits, and settlement times from the scheme but allows for method-specific overrides

3. **Given** payment methods connecting different node types, **when** validating connections, **then** the system enforces valid edge types (bank-to-bank, crypto-to-crypto, bank-to-crypto via exchange, etc.) based on scheme compatibility

4. **Given** payment methods with override configurations, **when** method-specific parameters are set, **then** they take precedence over scheme defaults while maintaining validation rules and operational constraints

5. **Given** payment methods as graph edges, **when** querying payment routes, **then** the system efficiently discovers paths between source and destination nodes using directed edge relationships

6. **Given** payment method operational parameters, **when** time-sensitive operations occur, **then** the system enforces cut-off times, operating hours, and holiday calendars from either method overrides or scheme inheritance

## Architecture

### Database Schema
```mermaid
erDiagram
    PAYMENT_METHODS {
        string method_id PK "ULID"
        string method_code "Unique identifier"
        string scheme_id FK "References payment_schemes"
        string name "NOT NULL"
        enum type "fiat|crypto|fx|internal"
        string currency "3-char ISO code"
        string target_currency "For FX methods"
        string source_node_id FK "References asset_nodes or fx_nodes"
        string destination_node_id FK "References asset_nodes or fx_nodes"
        json available_days "Override from scheme"
        json operating_hours "Override from scheme"
        json holiday_calendar "Override from scheme"
        json cut_off_times "Override from scheme"
        string settlement_time "Override from scheme"
        json fees "Override from scheme"
        decimal spread "Override from scheme"
        json limits "Override from scheme"
        string provider "Service provider name"
        boolean active "Method availability"
        timestamp created_at
        timestamp updated_at
    }
    
    PAYMENT_SCHEMES ||--o{ PAYMENT_METHODS : "defines_rules"
    ASSET_NODES ||--o{ PAYMENT_METHODS : "source"
    ASSET_NODES ||--o{ PAYMENT_METHODS : "destination"
    FX_NODES ||--o{ PAYMENT_METHODS : "fx_conversion"
```

### Payment Method Creation Flow
```mermaid
sequenceDiagram
    participant Admin as System Admin
    participant API as Payment Method API
    participant Service as Payment Method Service
    participant Validator as Method Validator
    participant SchemeService as Payment Scheme Service
    participant NodeService as Asset Node Service
    participant Repo as Payment Method Repository
    participant DB as PostgreSQL Database

    Admin->>API: POST /api/payment-methods
    API->>Service: createPaymentMethod(dto)
    Service->>Validator: validateNodeCompatibility(source, destination, scheme)
    Service->>NodeService: validateNodesExist(source_id, destination_id)
    Service->>SchemeService: getSchemeDefaults(scheme_id)
    Service->>Service: inheritSchemeProperties(scheme, overrides)
    Service->>Validator: validateOverrides(overrides, scheme_rules)
    Service->>Service: generateMethodCode(source, destination, scheme)
    Service->>Repo: save(method)
    Repo->>DB: INSERT INTO payment_methods
    DB-->>Repo: method with ID
    Repo-->>Service: saved method
    Service-->>API: method response
    API-->>Admin: 201 Created with payment method data
```

### Graph Edge Traversal
```mermaid
graph LR
    A[Bank Account USD] -->|SWIFT| B[Bank Account EUR]
    A -->|Internal| C[Exchange USD Account]
    C -->|Exchange| D[Exchange EUR Account]
    D -->|SEPA| B
    
    E[Crypto Wallet BTC] -->|Blockchain| F[Exchange BTC Wallet]
    F -->|FX| G[FX Node BTC->USD]
    G -->|Settlement| H[Exchange USD Account]
    H -->|Wire| A
```

## Technical Design Considerations

### Security
- Payment method IDs use ULIDs for secure identification
- Edge validation prevents unauthorized payment route creation
- Access control for payment method configuration and overrides
- Audit logging for all method configuration changes
- Validation of node ownership and access permissions

### Validation
- Node compatibility validation based on scheme requirements
- Currency compatibility between source/destination nodes and scheme
- Override parameter validation against scheme-defined constraints
- Circular reference detection in payment method chains
- Balance and limit validation for operational viability

### Performance
- Database indexes on method_id, scheme_id, source_node_id, destination_node_id
- Composite indexes for graph traversal queries
- Efficient edge discovery for path-finding algorithms
- Optimized queries for active payment methods by currency/type
- Graph traversal optimization using adjacency list patterns

### Database Design
- Foreign key constraints ensuring referential integrity
- Check constraints on currency compatibility and positive limits
- JSON field indexing for frequently queried override parameters
- Partial indexes for active vs inactive payment methods
- Constraint triggers for scheme inheritance validation

### Scheme Inheritance Logic
- Automatic inheritance of scheme properties at creation time
- Override precedence rules (method overrides beat scheme defaults)
- Dynamic property resolution during payment processing
- Validation of override compatibility with scheme constraints
- Change propagation when scheme properties are updated

### Graph Relationship Management
- Directed edge representation for unidirectional payment flows
- Bidirectional relationship support through paired methods
- Node degree calculation for connectivity analysis
- Edge weight calculation for pathfinding algorithms
- Disconnected component detection for network analysis

### Operational Override System
- Flexible override mechanism for all scheme properties
- Validation ensuring overrides don't violate business rules
- Default value fallback to scheme when no override specified
- Time-based override support for temporary configurations
- Bulk override operations for scheme-wide updates

### Payment Route Discovery
- Efficient graph traversal algorithms for pathfinding
- Multi-hop route discovery with intermediate conversions
- Cost calculation across multiple payment method edges
- Time-based route filtering using operational constraints
- Currency conversion path optimization through FX nodes

### Integration Points
- Repository pattern with graph-optimized query methods
- Event system for payment method status and configuration changes
- DTO validation with scheme inheritance awareness
- Swagger documentation with graph relationship examples
- Error handling for graph consistency and validation failures

### Scalability Considerations
- Efficient payment route discovery algorithms for large graphs
- Bulk payment method operations for network management
- Archive strategy for obsolete or discontinued payment methods
- Performance optimization for real-time route calculation
- Horizontal scaling preparation for high-volume payment processing

### Business Rule Enforcement
- Settlement time compatibility across connected methods
- Operating hour intersection for multi-hop routes
- Fee accumulation and limit aggregation across payment chains
- Currency conversion validation through supported FX pairs
- Regulatory compliance validation for cross-border payments
