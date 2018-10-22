### Introduction

Reproduces https://github.com/prisma/graphql-resolver-codegen/issues/42

Check TS error on line 18 in `Post.ts`. It complaints that `then` is missing but it should say `name` is missing. 

Uncommenting, line 21 makes the type inference work and makes the error go away. 

We should find the reason of why is this happening and potentially fix it. 

### Development workflow

1. Change schema
1. Run `yarn i` to generate interfaces
1. Run `yarn s -f` to force generate resolvers