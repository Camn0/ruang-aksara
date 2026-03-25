# Social Engine Logic

Deep dive into the community and engagement systems of Ruang Aksara.

## Threaded Conversations
The comment system uses a self-referential parent_id on the Comment model.
- Nesting: One level of deep nesting is currently supported in the UI, though the data model supports infinite recursiveness.
- Integrity: Deleting a parent comment can either cascade or orphan children based on the current implementation.

## Contextual Notifications
Notifications are not plain text. They use a Title|Snippet delimiter.
- Purpose: To show the user exactly which comment was liked or which work was updated.
- Parsing: The client-side notification component splits the string to render rich, clickable entries.
- Routing: Each notification carries an objectId and type to ensure correct redirection.

## Review and Rating System
Ratings are calculated using a cumulative Bayesian average to prevent "one-off" 5-star or 1-star reviews from skewing a work's score.
- Review Requirement: Users must provide a text review alongside a star rating.
- Upvotes: Helpful reviews can be upvoted by other readers to surface top-tier critique.
