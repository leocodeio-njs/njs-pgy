# tb-pgy

Payment Gateway -> API Service

## Contributing

```bash
pnpm install

```

Make code changes.

```bash
pnpm commit
```

# project structure

.
├── backend/
│ ├── src/
│ │ ├── common/
│ │ │ └── services/
│ │ │ └── razorpay.service.ts
│ │ ├── integration/
│ │ │ ├── products/
│ │ │ ├── subscriptions/
│ │ │ └── users/
│ │ ├── modules/
│ │ │ ├── customers/
│ │ │ ├── items/
│ │ │ ├── orders/
│ │ │ ├── payments/
│ │ │ ├── plans/
│ │ │ └── subscriptions/
│ │ ├── app.controller.spec.ts
│ │ ├── app.controller.ts
│ │ ├── app.module.ts
│ │ ├── app.service.ts
│ │ └── main.ts
│ ├── test/
│ ├── reference/
│ ├── dist/
│ ├── node_modules/
│ ├── package.json
│ ├── tsconfig.json
│ ├── .env
│ ├── .env.example
│ └── (other config files)
├── node_modules/
├── .devcontainer/
├── .husky/
├── package.json
├── docker-compose.yml
├── pnpm-workspace.yaml
└── (other config files)
