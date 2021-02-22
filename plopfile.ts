import { NodePlopAPI } from 'plop'

export default function (plop: NodePlopAPI) {
  plop.setGenerator('package', {
    description: 'Set up a new package',
    prompts: [
      {
        type: 'input',
        name: 'name',
        message: 'What will the name of the package be?',
      },
      {
        type: 'input',
        name: 'description',
        message: 'What is the package about?',
      },
    ],
    actions: [
      {
        type: 'addMany',
        destination: 'packages/{{name}}',
        base: 'template',
        templateFiles: 'template/**/*',
      },
    ],
  })
}
