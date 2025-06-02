# B2C2 Rails Graph Modeling Tool - Implementation Plan

## Executive Summary

This implementation plan details the development of a graph modeling tool for B2C2's payment network infrastructure. The tool will model bank accounts, crypto wallets, and payment methods as a connected graph, enabling path discovery and network analysis for modeling purposes.

## Project Scope

**In Scope:**
- Graph database for nodes (accounts/wallets) and edges (payment methods)
- Web-based UI for graph creation and maintenance
- Visual graph representation and navigation
- Path discovery simulation between source and target accounts
- Reference data management

**Out of Scope:**
- Live transaction orchestration
- Real-time balance updates
- Performance optimization for high-volume operations
- Integration with actual banking/crypto APIs

---

## Epic 1: Core Database Infrastructure

### Epic Description
Establish the foundational database schema and data access layer for storing the payment network graph.

### User Stories

#### Story 1.1: Legal Entity Data Model
**As a** system administrator  
**I want** to define and store legal entities (banks, exchangers, custodians)  
**So that** all accounts and wallets can be properly associated with their providers

**Acceptance Criteria:**
- Database table for legal entities with required fields (entity_id, name, country, entity_type, timezone)
- Support for entity types: bank, exchanger, payment_provider, custodian, fx_provider, branch
- Parent-child relationship support for branches
- Constraints based on entity type capabilities (can_host_accounts, can_host_wallets, can_host_fx_nodes)
- API endpoints for CRUD operations

**Database Schema:**
```sql
CREATE TABLE legal_entities (
    entity_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    country CHAR(2) NOT NULL,
    entity_type ENUM('bank', 'exchanger', 'payment_provider', 'custodian', 'fx_provider', 'branch') NOT NULL,
    timezone VARCHAR(50) NOT NULL,
    regulatory_scope VARCHAR(50),
    parent_entity_id VARCHAR(50) REFERENCES legal_entities(entity_id),
    can_host_accounts BOOLEAN DEFAULT false,
    can_host_wallets BOOLEAN DEFAULT false,
    can_host_fx_nodes BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Story 1.2: Payment Scheme Data Model
**As a** system administrator  
**I want** to define payment schemes (SEPA, SWIFT, crypto networks)  
**So that** payment methods can inherit baseline rules and characteristics

**Acceptance Criteria:**
- Database table for payment schemes with inheritance rules
- Support for scheme types: fiat, crypto, fx
- Time-based availability configuration
- Fee and limit structures
- Currency-specific scheme definitions

**Database Schema:**
```sql
CREATE TABLE payment_schemes (
    scheme_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('fiat', 'crypto', 'fx') NOT NULL,
    currency CHAR(3),
    target_currency CHAR(3),
    country_scope VARCHAR(50) NOT NULL,
    available_days JSON, -- ["Mon", "Tue", ...]
    operating_hours JSON, -- {"start": "07:00", "end": "15:00"}
    holiday_calendar JSON, -- ["2025-01-01", ...]
    cut_off_time TIME,
    settlement_time VARCHAR(20),
    fees JSON, -- {"flat_fee": 1.0, "percentage_fee": 0.001}
    spread DECIMAL(10,6),
    limits JSON, -- {"min": 10.0, "max": 100000.0}
    supports_fx BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Story 1.3: External Parties Data Model
**As a** system administrator  
**I want** to define external parties (clients, providers, employees)  
**So that** external accounts can be properly categorized and managed

**Acceptance Criteria:**
- Database table for external parties
- Support for party types: client, provider, employee
- KYC status tracking
- Relationship management fields

**Database Schema:**
```sql
CREATE TABLE external_parties (
    external_id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('client', 'provider', 'employee') NOT NULL,
    jurisdiction CHAR(2) NOT NULL,
    kyc_status ENUM('verified', 'pending', 'blocked') NOT NULL,
    relationship_start TIMESTAMP,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Story 1.4: Asset Nodes Data Model
**As a** system administrator  
**I want** to define asset nodes (bank accounts, crypto wallets, FX venues)  
**So that** the payment network graph can be constructed

**Acceptance Criteria:**
- Database table for asset nodes with polymorphic design
- Support for node types: bank_account, crypto_wallet, external_bank_account, external_crypto_wallet
- Currency and geographic constraints
- Balance tracking fields (for modeling purposes)
- Operating hours and availability

**Database Schema:**
```sql
CREATE TABLE asset_nodes (
    node_id VARCHAR(50) PRIMARY KEY,
    type ENUM('ASSET_NODE', 'FX_NODE') NOT NULL,
    sub_type ENUM('bank_account', 'crypto_wallet', 'external_bank_account', 'external_crypto_wallet') NOT NULL,
    currency CHAR(3) NOT NULL,
    country CHAR(2) NOT NULL,
    account_holder_name VARCHAR(255) NOT NULL,
    account_holder_id VARCHAR(50), -- References external_parties for external nodes
    legal_entity_id VARCHAR(50) NOT NULL REFERENCES legal_entities(entity_id),
    
    -- Bank account specific
    iban VARCHAR(34),
    
    -- Crypto wallet specific
    blockchain_address VARCHAR(100),
    network VARCHAR(50),
    
    -- Operational details
    timezone VARCHAR(50),
    operating_days JSON,
    operating_hours VARCHAR(20),
    status VARCHAR(100),
    direction ENUM('in', 'out', 'bidirectional') DEFAULT 'bidirectional',
    
    -- Balance information (for modeling)
    last_known_balance DECIMAL(20,8),
    available_balance DECIMAL(20,8),
    earmarked_balance DECIMAL(20,8),
    last_update TIMESTAMP,
    
    -- Compliance
    kyc_verified BOOLEAN DEFAULT false,
    blocked BOOLEAN DEFAULT false,
    under_review BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (account_holder_id) REFERENCES external_parties(external_id),
    FOREIGN KEY (legal_entity_id) REFERENCES legal_entities(entity_id)
);
```

#### Story 1.5: FX Nodes Data Model
**As a** system administrator  
**I want** to define isolated FX venues  
**So that** external FX providers can be modeled in the network

**Acceptance Criteria:**
- Database table for FX nodes with currency pair support
- Pricing and spread configuration
- Settlement time and availability
- Connection to entry/exit accounts

**Database Schema:**
```sql
CREATE TABLE fx_nodes (
    node_id VARCHAR(50) PRIMARY KEY,
    currency_pair VARCHAR(10) NOT NULL, -- "USD->EUR"
    provider_name VARCHAR(255) NOT NULL,
    exchanger VARCHAR(255),
    legal_entity_id VARCHAR(50) NOT NULL REFERENCES legal_entities(entity_id),
    
    -- Gate information
    gate_type ENUM('fiat', 'crypto') NOT NULL,
    gate_iban VARCHAR(34),
    gate_blockchain_address VARCHAR(100),
    gate_network VARCHAR(50),
    
    -- Pricing
    fx_rate DECIMAL(15,8),
    fx_spread DECIMAL(10,6),
    cost_model ENUM('flat_fee', 'tiered', 'included') DEFAULT 'flat_fee',
    fixed_cost DECIMAL(10,2),
    
    -- Execution details
    settlement_time VARCHAR(20),
    availability VARCHAR(100),
    status VARCHAR(100) DEFAULT 'available',
    
    -- Limits
    min_size DECIMAL(20,8),
    max_size DECIMAL(20,8),
    currency_in CHAR(3),
    currency_out CHAR(3),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### Story 1.6: Payment Methods (Edges) Data Model
**As a** system administrator  
**I want** to define payment methods connecting accounts  
**So that** the graph edges represent possible payment routes

**Acceptance Criteria:**
- Database table for payment methods as directed edges
- Inheritance from payment schemes
- Source and destination account references
- Method-specific overrides for fees, limits, and timing

**Database Schema:**
```sql
CREATE TABLE payment_methods (
    method_id VARCHAR(50) PRIMARY KEY,
    method_code VARCHAR(50) NOT NULL,
    scheme_id VARCHAR(50) REFERENCES payment_schemes(scheme_id),
    name VARCHAR(255) NOT NULL,
    type ENUM('fiat', 'crypto', 'fx', 'internal') NOT NULL,
    currency CHAR(3),
    target_currency CHAR(3),
    
    -- Edge definition
    source_node_id VARCHAR(50) NOT NULL,
    destination_node_id VARCHAR(50) NOT NULL,
    
    -- Operational overrides (inherit from scheme if NULL)
    available_days JSON,
    operating_hours JSON,
    holiday_calendar JSON,
    cut_off_times JSON,
    settlement_time VARCHAR(20),
    
    -- Pricing overrides
    fees JSON,
    spread DECIMAL(10,6),
    limits JSON,
    
    provider VARCHAR(255),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (source_node_id) REFERENCES asset_nodes(node_id),
    FOREIGN KEY (destination_node_id) REFERENCES asset_nodes(node_id)
);
```

---

## Epic 2: Reference Data Management

### Epic Description
Implement management interfaces for reference data including currencies, countries, and configuration options.

### User Stories

#### Story 2.1: Configuration Tables
**As a** system administrator  
**I want** to manage reference data through configuration tables  
**So that** dropdown options and validation rules are centrally maintained

**Acceptance Criteria:**
- Currency master table (ISO 4217)
- Country master table (ISO 3166-1)
- Configuration tables for enums and options
- Admin interface for maintaining reference data

**Database Schema:**
```sql
CREATE TABLE currencies (
    code CHAR(3) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    numeric_code CHAR(3),
    minor_unit INT,
    active BOOLEAN DEFAULT true
);

CREATE TABLE countries (
    code CHAR(2) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    continent VARCHAR(50),
    timezone_primary VARCHAR(50),
    active BOOLEAN DEFAULT true
);

CREATE TABLE config_options (
    category VARCHAR(50) NOT NULL,
    option_key VARCHAR(50) NOT NULL,
    option_value VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    sort_order INT DEFAULT 0,
    active BOOLEAN DEFAULT true,
    PRIMARY KEY (category, option_key)
);
```

#### Story 2.2: Validation Rules Engine
**As a** system administrator  
**I want** validation rules to be enforced automatically  
**So that** data integrity is maintained across the graph

**Acceptance Criteria:**
- Database constraints for entity type capabilities
- Validation logic for currency/country combinations
- Referential integrity checks
- Business rule validation (e.g., no self-loops except self-instant)

---

## Epic 3: Core Graph Management APIs

### Epic Description
Develop REST APIs for managing all graph entities with proper validation and dependency enforcement.

### User Stories

#### Story 3.1: Legal Entity Management API
**As a** developer  
**I want** REST endpoints for legal entity operations  
**So that** the frontend can manage entity data

**Acceptance Criteria:**
- CRUD endpoints for legal entities
- Validation of entity type constraints
- Cascade operations for dependent entities
- Audit logging for all changes

**API Endpoints:**
- `GET /api/legal-entities` - List all entities
- `POST /api/legal-entities` - Create new entity
- `GET /api/legal-entities/{id}` - Get entity details
- `PUT /api/legal-entities/{id}` - Update entity
- `DELETE /api/legal-entities/{id}` - Delete entity (with dependency check)

#### Story 3.2: Asset Node Management API
**As a** developer  
**I want** REST endpoints for asset node operations  
**So that** accounts and wallets can be managed through the UI

**Acceptance Criteria:**
- CRUD endpoints for asset nodes
- Automatic scheme attachment based on currency/country
- Validation of node types against legal entity capabilities
- Balance update endpoints (for modeling)

#### Story 3.3: Payment Method Management API
**As a** developer  
**I want** REST endpoints for payment method operations  
**So that** graph edges can be created and maintained

**Acceptance Criteria:**
- CRUD endpoints for payment methods
- Automatic edge creation based on schemes
- Validation of source/destination node compatibility
- Directionality enforcement

---

## Epic 4: Web-Based User Interface

### Epic Description
Create a responsive web interface for graph management with intuitive navigation and forms.

### User Stories

#### Story 4.1: Application Shell and Navigation
**As a** user  
**I want** a clean, intuitive interface layout  
**So that** I can efficiently navigate the graph management features

**Acceptance Criteria:**
- Responsive layout with left sidebar navigation
- Top bar with user context and quick search
- Main content area with dynamic views
- Breadcrumb navigation for deep hierarchies

**UI Components:**
- Header component with search and user menu
- Sidebar navigation with collapsible sections
- Main layout component with routing
- Loading states and error handling

#### Story 4.2: Legal Entity Management Interface
**As a** user  
**I want** to create and manage legal entities  
**So that** I can establish the foundation for the payment network

**Acceptance Criteria:**
- List view with search and filtering
- Create/edit forms with validation
- Entity type-specific field controls
- Hierarchical display for parent-child relationships

**UI Components:**
- Legal entity list component with data table
- Entity form component with conditional fields
- Entity type selector with capability constraints
- Parent entity selector for branches

#### Story 4.3: Asset Node Management Interface
**As a** user  
**I want** to create and manage asset nodes  
**So that** I can build the network of accounts and wallets

**Acceptance Criteria:**
- Node type-specific forms (bank account vs crypto wallet)
- Legal entity association with inheritance
- Currency and country selectors with validation
- Balance management (for modeling purposes)

**UI Components:**
- Node list with type-based filtering
- Polymorphic form component based on node type
- Currency/country dropdowns with validation
- Balance input components with currency formatting

#### Story 4.4: Payment Scheme Management Interface
**As a** user  
**I want** to define and manage payment schemes  
**So that** payment methods can inherit proper configurations

**Acceptance Criteria:**
- Scheme list with type-based categorization
- Time-based availability configuration UI
- Fee and limit configuration forms
- Preview of affected payment methods

**UI Components:**
- Scheme list with type filters
- Time picker components for operating hours
- Fee/limit configuration forms
- Multi-select for available days

#### Story 4.5: Payment Method Visualization
**As a** user  
**I want** to view and manage payment methods as graph connections  
**So that** I can understand the network topology

**Acceptance Criteria:**
- List view of all payment methods with source/destination
- Filtering by scheme type, currency, status
- Bulk operations for enabling/disabling methods
- Connection details with inherited vs overridden properties

---

## Epic 5: Graph Visualization

### Epic Description
Implement interactive graph visualization for understanding network topology and testing connections.

### User Stories

#### Story 5.1: Interactive Network Graph
**As a** user  
**I want** to visualize the payment network as an interactive graph  
**So that** I can understand the topology and identify connection patterns

**Acceptance Criteria:**
- Force-directed graph layout with draggable nodes
- Node sizing based on configurable metrics (balance, connection count)
- Color coding by node type, status, or currency
- Edge styling based on payment method type
- Zoom and pan capabilities
- Node clustering for legal entities

**Technical Requirements:**
- Use D3.js or similar graph visualization library
- Support for 100+ nodes without performance degradation
- Responsive design for different screen sizes
- Export capabilities (PNG, SVG)

#### Story 5.2: Graph Filtering and Search
**As a** user  
**I want** to filter and search the graph visualization  
**So that** I can focus on specific parts of the network

**Acceptance Criteria:**
- Filter by currency, country, legal entity
- Filter by node type (internal, external, FX)
- Filter by connection status (active, inactive, blocked)
- Text search for node names and identifiers
- Saved filter presets

#### Story 5.3: Hierarchical Graph Views
**As a** user  
**I want** to zoom in and out of graph detail levels  
**So that** I can see both high-level topology and detailed connections

**Acceptance Criteria:**
- Legal entity level view (entities as super-nodes)
- Account level view (individual accounts visible)
- Payment method level view (detailed edge information)
- Smooth transitions between detail levels
- Context preservation during navigation

---

## Epic 6: Path Discovery Engine

### Epic Description
Implement path finding algorithms to discover viable routes between source and destination accounts.

### User Stories

#### Story 6.1: Basic Path Discovery Algorithm
**As a** user  
**I want** to find possible payment paths between two accounts  
**So that** I can understand routing options and constraints

**Acceptance Criteria:**
- Dijkstra's or A* algorithm implementation for shortest path
- Support for weighted edges (cost, time, reliability)
- Respect for directional constraints
- Currency conversion path detection
- Maximum path length limitations to prevent infinite loops

**Technical Requirements:**
- Graph algorithm library integration
- Configurable path weights (time vs cost vs reliability)
- Path validation against operational constraints
- Performance optimization for large graphs

#### Story 6.2: Path Discovery Interface
**As a** user  
**I want** a user interface for path discovery testing  
**So that** I can simulate payment routing scenarios

**Acceptance Criteria:**
- Source and destination account selectors
- Amount and currency input
- Path options display with metrics (time, cost, hops)
- Visual path highlighting on graph
- Export path details for analysis

**UI Components:**
- Path discovery form with account autocomplete
- Results table with sortable path options
- Path visualization overlay on graph
- Export functionality for path analysis

#### Story 6.3: Advanced Path Options
**As a** user  
**I want** to discover paths with advanced constraints  
**So that** I can test complex routing scenarios

**Acceptance Criteria:**
- Time window constraints (available during specific hours)
- Excluded node/edge constraints
- Minimum/maximum hop count limits
- Currency-specific routing preferences
- Multiple path alternatives ranking

#### Story 6.4: FX Integration in Path Discovery
**As a** user  
**I want** to find paths that include foreign exchange  
**So that** I can route payments across different currencies

**Acceptance Criteria:**
- FX node integration in path algorithms
- Currency conversion cost calculation
- FX spread and fee inclusion in path costs
- Support for both isolated FX venues and integrated FX
- Multi-currency path optimization

---

## Epic 7: System Administration

### Epic Description
Implement system administration features including audit logging, user management, and data integrity tools.

### User Stories

#### Story 7.1: Audit Trail System
**As a** system administrator  
**I want** complete audit trails for all graph modifications  
**So that** I can track changes and maintain compliance

**Acceptance Criteria:**
- Audit log table with before/after values
- User attribution for all changes
- Timestamp and IP address logging
- Searchable audit interface
- Data retention policies

#### Story 7.2: Data Integrity Validation
**As a** system administrator  
**I want** to validate graph integrity  
**So that** I can identify and fix data inconsistencies

**Acceptance Criteria:**
- Orphaned node detection
- Circular dependency detection
- Currency/country mismatch identification
- Balance reconciliation tools
- Automated validation reports

#### Story 7.3: Bulk Operations Interface
**As a** user  
**I want** to perform bulk operations on graph entities  
**So that** I can efficiently manage large datasets

**Acceptance Criteria:**
- Multi-select interface for bulk selection
- Bulk enable/disable operations
- Bulk attribute updates
- CSV import/export functionality
- Operation preview and confirmation

---

## Epic 8: Testing and Quality Assurance

### Epic Description
Implement comprehensive testing coverage and quality assurance measures.

### User Stories

#### Story 8.1: Unit Test Coverage
**As a** developer  
**I want** comprehensive unit test coverage  
**So that** the system is reliable and maintainable

**Acceptance Criteria:**
- >90% code coverage for business logic
- Test coverage for all API endpoints
- Database constraint testing
- Path discovery algorithm testing

#### Story 8.2: Integration Testing
**As a** developer  
**I want** integration tests for critical workflows  
**So that** the system components work together correctly

**Acceptance Criteria:**
- End-to-end graph creation workflows
- Path discovery with various scenarios
- UI component integration tests
- API integration tests

---

## Technical Architecture

### Backend Technology Stack
- **Language:** Python/Django or Node.js/Express
- **Database:** PostgreSQL with JSON support
- **API:** REST with OpenAPI specification
- **Authentication:** JWT tokens
- **Validation:** JSON Schema validation

### Frontend Technology Stack
- **Framework:** React.js with TypeScript
- **State Management:** Redux Toolkit or Zustand
- **UI Components:** Material-UI or Ant Design
- **Graph Visualization:** D3.js or Cytoscape.js
- **Forms:** React Hook Form with Yup validation
- **HTTP Client:** Axios with request/response interceptors

### Development Tools
- **Version Control:** Git with feature branch workflow
- **Testing:** Jest (unit), Cypress (E2E)
- **Documentation:** OpenAPI for APIs, Storybook for UI components
- **Code Quality:** ESLint, Prettier, SonarQube
- **CI/CD:** GitHub Actions or GitLab CI

---

## Implementation Timeline

### Phase 1 (Weeks 1-4): Foundation
- Epic 1: Core Database Infrastructure
- Epic 2: Reference Data Management
- Basic project setup and development environment

### Phase 2 (Weeks 5-8): Core Functionality
- Epic 3: Core Graph Management APIs
- Epic 4: Web-Based User Interface (Stories 4.1-4.3)
- Basic CRUD operations and validation

### Phase 3 (Weeks 9-12): Advanced Features
- Epic 4: Web-Based User Interface (Stories 4.4-4.5)
- Epic 5: Graph Visualization
- Interactive graph and filtering capabilities

### Phase 4 (Weeks 13-16): Path Discovery
- Epic 6: Path Discovery Engine
- Algorithm implementation and UI integration
- Performance optimization

### Phase 5 (Weeks 17-20): Polish and Administration
- Epic 7: System Administration
- Epic 8: Testing and Quality Assurance
- Documentation and deployment preparation

---

## Success Criteria

1. **Functional Requirements Met:**
   - Complete graph model implementation
   - Intuitive user interface for graph management
   - Working path discovery with multiple routing options
   - Comprehensive validation and error handling

2. **Quality Standards:**
   - >90% test coverage
   - <2 second response times for path discovery
   - Support for graphs with 1000+ nodes
   - Zero data integrity issues

3. **User Experience:**
   - Intuitive navigation and forms
   - Responsive design across devices
   - Clear visual feedback and error messages
   - Comprehensive help documentation

4. **Technical Standards:**
   - Clean, maintainable code architecture
   - Comprehensive API documentation
   - Secure authentication and authorization
   - Scalable database design

This implementation plan provides a structured approach to building the B2C2 Rails graph modeling tool, with clear deliverables and acceptance criteria for each epic and story.
