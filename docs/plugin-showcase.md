# Markdown Plugin Features Showcase

This page demonstrates all the markdown plugins implemented in Okidoki: Table of Contents, MathJax3, Mermaid diagrams, and Emoji support.

[[toc]]

## Introduction :wave:

Welcome to the comprehensive showcase of markdown plugin features! This page demonstrates how Okidoki enhances your documentation with powerful markdown extensions. :sparkles:

## Table of Contents Plugin :bookmark_tabs:

The table of contents plugin automatically generates a hierarchical navigation based on your document headings. Simply add `[[toc]]` anywhere in your document to create a table of contents.

### Features
- Automatic heading detection
- Hierarchical structure
- Clickable anchor links
- Customizable styling

## Mathematical Expressions :abacus:

MathJax3 plugin enables beautiful mathematical notation using LaTeX syntax.

### Inline Math

Here's Einstein's famous equation: $E = mc^2$

The quadratic formula: $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$

### Block Math

The Gaussian integral:

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

Maxwell's equations:

$$
\begin{align}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} &= \frac{4\pi}{c}\vec{\mathbf{j}} \\
\nabla \cdot \vec{\mathbf{E}} &= 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} &= \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} &= 0
\end{align}
$$

### Matrix Operations

Matrix multiplication:

$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
\begin{pmatrix}
e & f \\
g & h
\end{pmatrix}
=
\begin{pmatrix}
ae+bg & af+bh \\
ce+dg & cf+dh
\end{pmatrix}
$$

## Mermaid Diagrams :chart_with_upwards_trend:

Mermaid plugin creates beautiful, interactive diagrams from simple text syntax.

### Flowchart

```mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great! :smile:]
    C --> D[Continue]
    D --> B
    B -->|No| E[Debug :thinking:]
    E --> F[Fix Issues]
    F --> B
    B -->|Perfect| G[Deploy :rocket:]
    G --> H[End]
```

### Sequence Diagram

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    
    User->>Frontend: Request data
    Frontend->>Backend: API call
    Backend->>Database: Query
    Database-->>Backend: Results
    Backend-->>Frontend: JSON response
    Frontend-->>User: Display data
```

### Class Diagram

```mermaid
classDiagram
    class Document {
        +String title
        +String content
        +Date created
        +render()
        +save()
    }
    class Plugin {
        +String name
        +String version
        +process()
    }
    class MarkdownProcessor {
        +List~Plugin~ plugins
        +String process()
        +addPlugin()
    }
    
    MarkdownProcessor --> Plugin : uses
    MarkdownProcessor --> Document : creates
```

### Gantt Chart

```mermaid
gantt
    title Plugin Implementation Timeline
    dateFormat  YYYY-MM-DD
    section Setup
    Install packages    :done, setup1, 2024-01-01, 1d
    Configure plugins   :done, setup2, after setup1, 1d
    section Testing
    Create test files   :active, test1, 2024-01-03, 2d
    Validate output     :test2, after test1, 1d
    section Documentation
    Write examples      :doc1, 2024-01-06, 2d
    Update README       :doc2, after doc1, 1d
```

### State Diagram

```mermaid
graph TD
    A[Idle] --> B[Processing]
    B --> C[Success]
    B --> D[Error]
    C --> A
    D --> A
    D --> B
```

## Emoji Support :art:

The emoji plugin converts shortcode syntax to beautiful Unicode emojis.

### Basic Emojis

Common expressions: :smile: :heart: :thumbsup: :fire: :rocket: :star: :tada: :sparkles:

### Technical Emojis

Development workflow: :computer: :keyboard: :mouse: :floppy_disk: :camera: :telephone: :bulb: :gear:

### Nature & Weather

Environmental: :sunny: :cloud: :rainbow: :snowflake: :zap: :earth_americas: :moon: :star2:

### Food & Activities

Life & leisure: :coffee: :cake: :pizza: :beer: :soccer: :basketball: :tennis: :swimming:

### Status Indicators

Feedback: :white_check_mark: :x: :warning: :information_source: :exclamation: :question: :heavy_check_mark: :negative_squared_cross_mark:

## Combined Features :mag:

You can combine all these features in a single document! Here's an example:

### Project Status Dashboard :chart_with_upwards_trend:

Our development process follows this workflow:

```mermaid
graph LR
    A[Idea :bulb:] --> B[Plan :clipboard:]
    B --> C[Code :computer:]
    C --> D[Test :test_tube:]
    D --> E{Pass? :question:}
    E -->|Yes :white_check_mark:| F[Deploy :rocket:]
    E -->|No :x:| G[Debug :bug:]
    G --> C
    F --> H[Monitor :chart:]
```

The success rate can be calculated using:

$$P(success) = \frac{\text{successful deployments}}{\text{total attempts}} \times 100\%$$

Current metrics show: :chart_with_upwards_trend: **95%** success rate! :tada:

## Conclusion :checkered_flag:

This showcase demonstrates the powerful capabilities of Okidoki's markdown plugin ecosystem:

- **Table of Contents**: Automatic navigation :bookmark_tabs:
- **MathJax3**: Beautiful mathematical notation :abacus:
- **Mermaid**: Interactive diagrams :chart_with_upwards_trend:
- **Emoji**: Expressive visual elements :art:

All plugins work seamlessly together to create rich, engaging documentation! :sparkles: :rocket: :star:

---

*Happy documenting!* :wave: :heart:
