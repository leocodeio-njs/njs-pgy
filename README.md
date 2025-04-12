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

# admin ( product )

1. create plan ( we get plan id from pgy )
2. create product with it, and the subscription terms

# user ( subscription )

1. check if the customer entry exists for the one who is subscribing
2. if not, create a new customer ( we got the customer id from pgy )
3. according to the plan clicked by the user, we get the product id and the subscription terms
4. create a new subscription ( plan id, subscription terms, customer id )
5. make the payment
6. after the payment is successful, we update the subscription status
7. we also save the payment details in the subscription
