---
publish: true
---

[StoryM](https://github.com/StoryM-AI)

# StoryM Backend

## Key Features

### User Authentication

* User registration and login
* JWT-based authentication
* User profile retrieval

### Project Management

* Create video planning projects
* Retrieve projects by user
* View and update project information
* Delete projects and their related data

### Video Planning Questions

* Provide guided questions about the target audience, video topic, emotion, platform, and production direction
* Save and retrieve planning responses for each project

### AI Mind Map Generation

* Generate a scene structure based on the user's planning responses
* Store and retrieve mind maps for each project
* Add new scenes to an existing mind map
* Manage the order and visibility of generated scenes

### Storyboard Generation

* Generate scene-based storyboards from an existing mind map
* Store and retrieve storyboards by project

## Service Flow

```text
Create Project
      ↓
Answer Video Planning Questions
      ↓
Generate AI Mind Map
      ↓
Organize and Extend Scenes
      ↓
Generate Storyboard
```

## Tech Stack

| Category        | Technology             |
| --------------- | ---------------------- |
| Backend         | FastAPI, Python        |
| Database        | Neo4j                  |
| AI              | OpenAI API             |
| Authentication  | JWT                    |
| Data Validation | Pydantic               |
| Infrastructure  | Docker, Docker Compose |

## Project Structure

```text
app/
├── api/v1/                 # Authentication, project, mind map, and storyboard APIs
├── config/                 # Database and environment configuration
├── crud/                   # Neo4j data access and Cypher query logic
├── models/                 # Database models
├── schemas/                # API request and response schemas
├── api/v1/service/
│   ├── mindmap_service.py  # AI mind map generation logic
│   ├── storyboard_service.py
│   └── image_service.py
└── main.py                 # FastAPI application entry point
```

## Main API Domains

* `auth`: User authentication and account management
* `projects`: Project and planning response management
* `questions`: Video planning question delivery
* `mindmap`: AI-powered scene structure generation and retrieval
* `storyboard`: Storyboard generation and retrieval

## Graph Database

StoryM uses **Neo4j**, a graph database, to manage video planning data and the relationships between users, projects, answers, mind maps, and scenes.

Instead of storing all project data in a single document or relational table structure, each domain object is represented as an independent node. Relationships between nodes describe ownership, project membership, and scene progression.

This model is especially useful for representing a storyboard as an ordered sequence of connected scenes.

### Graph Data Model

```text
(User)
   │
   └──[:CREATED]──> (Project)
                        │
                        ├──[:HAS_ANSWER]──> (Answer)
                        │
                        └──[:HAS_MINDMAP]──> (Mindmap)
                                                │
                                                └──[:HAS_SCENE]──> (Scene)
                                                                        │
                                                                        └──[:NEXT_SCENE]──> (Scene)
                                                                                                │
                                                                                                └──[:NEXT_SCENE]──> ...
```

### Main Nodes

| Node      | Description                                | Main Properties                                                     |
| --------- | ------------------------------------------ | ------------------------------------------------------------------- |
| `User`    | A registered StoryM user                   | `id`, authentication information                                    |
| `Project` | A single video planning project            | `id`, `title`, `description`, `main_topic`, `sub_topic`             |
| `Answer`  | A response to a video planning question    | `question_id`, `project_id`, `answer`                               |
| `Mindmap` | A generated scene structure for a project  | `id`, `name`, `created_at`                                          |
| `Scene`   | An individual scene in the video structure | `id`, `name`, `description`, `order`, `image_url`, `display_status` |

### Main Relationships

| Relationship  | Connection          | Description                                           |
| ------------- | ------------------- | ----------------------------------------------------- |
| `CREATED`     | `User → Project`    | Connects a user to a project they created             |
| `HAS_ANSWER`  | `Project → Answer`  | Connects a project to its planning responses          |
| `HAS_MINDMAP` | `Project → Mindmap` | Connects a project to its generated mind map          |
| `HAS_SCENE`   | `Mindmap → Scene`   | Connects a mind map to its first scene                |
| `NEXT_SCENE`  | `Scene → Scene`     | Represents the progression from one scene to the next |

### Scene Sequence Modeling

The first scene of a mind map is connected through a `HAS_SCENE` relationship. Each following scene is connected to the previous scene through a `NEXT_SCENE` relationship.

```text
(Mindmap)
   └──[:HAS_SCENE]──> (Scene 1)
                          └──[:NEXT_SCENE]──> (Scene 2)
                                                 └──[:NEXT_SCENE]──> (Scene 3)
```

This approach represents the video flow as a linked graph rather than relying only on scene numbers or array indexes.

It allows StoryM to:

* Traverse scenes in sequence
* Add new scenes to an existing flow
* Retrieve all scenes connected to a mind map
* Manage scene visibility and ordering
* Remove related answers, mind maps, and scenes when a project is deleted

### Graph-Based Data Management

Neo4j Cypher queries are used to create nodes, connect relationships, and traverse project data.

For example, when a project is created, it is connected to its owner through a `CREATED` relationship.

```cypher
MATCH (user:User {id: $user_id})
CREATE (project:Project {
    id: $project_id,
    title: $title,
    description: $description
})
CREATE (user)-[:CREATED]->(project)
RETURN project
```

A planning response is stored as an `Answer` node connected to its project.

```cypher
MATCH (project:Project {id: $project_id})
CREATE (answer:Answer {
    question_id: $question_id,
    project_id: $project_id,
    answer: $answer
})
CREATE (project)-[:HAS_ANSWER]->(answer)
RETURN answer
```

New scenes can be appended by connecting them to the previous scene through a `NEXT_SCENE` relationship.

```cypher
MATCH (previous:Scene {id: $previous_scene_id})
CREATE (scene:Scene {
    id: $scene_id,
    name: $scene_name,
    description: $scene_description,
    order: $order
})
CREATE (previous)-[:NEXT_SCENE]->(scene)
RETURN scene
```

By modeling data as connected nodes, StoryM can manage the full video planning lifecycle through relationship-based queries and graph traversal.
