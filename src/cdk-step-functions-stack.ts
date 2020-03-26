import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import { Function, AssetCode, Runtime, FunctionProps } from '@aws-cdk/aws-lambda';
import { Chain, Choice, Condition, Fail, StateMachine, Task } from '@aws-cdk/aws-stepfunctions';
import { InvokeFunction } from '@aws-cdk/aws-stepfunctions-tasks';

export class CdkStepFunctionsStack extends Stack {
  private getLambdaProps = (handler: string): FunctionProps => {
    const lambdaPath = `${__dirname}/lambda`;
    const runtime = Runtime.NODEJS_12_X;
    const code = new AssetCode(lambdaPath);

    return { runtime, code, handler };
  };

  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // Lambdas
    const openCaseLambda = new Function(this, 'openCaseFunction', this.getLambdaProps('open-case.handler'));
    const assignCaseLambda = new Function(this, 'assignCaseFunction', this.getLambdaProps('assign-case.handler'));
    const workOnCaseLambda = new Function(this, 'workOnCaseFunction', this.getLambdaProps('work-on-case.handler'));
    const closeCaseLambda = new Function(this, 'closeCaseFunction', this.getLambdaProps('close-case.handler'));
    const escalateCaseLambda = new Function(this, 'escalateCaseFunction', this.getLambdaProps('escalate-case.handler'));

    // Step Function Tasks
    const openCaseTask = new Task(this, 'Open Case', { task: new InvokeFunction(openCaseLambda) });
    const assignCaseTask = new Task(this, 'Assign Case', { task: new InvokeFunction(assignCaseLambda) });
    let workOnCaseTask = new Task(this, 'Work On Case', { task: new InvokeFunction(workOnCaseLambda) });

    workOnCaseTask.addRetry({
      errors: [
        "Lambda.Unknown",
        "States.TaskFailed"
      ],
      interval: Duration.seconds(3),
      maxAttempts: 5,
      backoffRate: 1.5
    });

    const closeCaseTask = new Task(this, 'Close Case', { task: new InvokeFunction(closeCaseLambda) });
    const escalateCaseTask = new Task(this, 'Escalate Case', { task: new InvokeFunction(escalateCaseLambda) });
    const jobFailed = new Fail(this, 'Fail', { cause: 'Engage Tier 2 Support' });
    const isComplete = new Choice(this, 'Is Case Resolved');

    const success = 1;
    const failure = 0;

    const chain = Chain
    .start(openCaseTask)
    .next(assignCaseTask)
    .next(workOnCaseTask)
    .next(
      isComplete
      .when(Condition.numberEquals('$.Status', success), closeCaseTask)
      .when(Condition.numberEquals('$.Status', failure), escalateCaseTask.next(jobFailed))
    );

    new StateMachine(this, 'StateMachine', {
      definition: chain
    });
  }
}
