export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
}
export const users: User[] = [
  {
    id: "1",
    name: "Ryan Chenkie",
    email: "ryanc@dundermifflin.com",
    password: "password",
  },
  {
    id: "2",
    name: "Michael Scott",
    email: "mscott@dundermifflin.com",
    password: "password",
  },
  {
    id: "3",
    name: "Dwight Schrute",
    email: "dschrute@dundermifflin.com",
    password: "password",
  },
];
