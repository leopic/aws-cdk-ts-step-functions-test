import { Construct, Duration, Stack, StackProps } from '@aws-cdk/core';
import { Function, AssetCode, Runtime, FunctionProps } from '@aws-cdk/aws-lambda';
import { Chain, Choice, Condition, Fail, Parallel, StateMachine, Task } from '@aws-cdk/aws-stepfunctions';
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
    const openCaseLambda2 = new Function(this, 'openCaseFunction2', this.getLambdaProps('open-case.handler'));
    const openCaseLambda3 = new Function(this, 'openCaseFunction3', this.getLambdaProps('open-case.handler'));
    const openCaseLambda4 = new Function(this, 'openCaseFunction4', this.getLambdaProps('open-case.handler'));

    const assignCaseLambda = new Function(this, 'assignCaseFunction', this.getLambdaProps('assign-case.handler'));
    const assignCaseLambda2 = new Function(this, 'assignCaseFunction2', this.getLambdaProps('assign-case.handler'));
    const assignCaseLambda3 = new Function(this, 'assignCaseFunction3', this.getLambdaProps('assign-case.handler'));
    const assignCaseLambda4 = new Function(this, 'assignCaseFunction4', this.getLambdaProps('assign-case.handler'));

    const workOnCaseLambda = new Function(this, 'workOnCaseFunction', this.getLambdaProps('work-on-case.handler'));
    const workOnCaseLambda2 = new Function(this, 'workOnCaseFunction2', this.getLambdaProps('work-on-case.handler'));
    const workOnCaseLambda3 = new Function(this, 'workOnCaseFunction3', this.getLambdaProps('work-on-case.handler'));
    const workOnCaseLambda4 = new Function(this, 'workOnCaseFunction4', this.getLambdaProps('work-on-case.handler'));

    const closeCaseLambda = new Function(this, 'closeCaseFunction', this.getLambdaProps('close-case.handler'));
    const closeCaseLambda2 = new Function(this, 'closeCaseFunction2', this.getLambdaProps('close-case.handler'));
    const closeCaseLambda3 = new Function(this, 'closeCaseFunction3', this.getLambdaProps('close-case.handler'));
    const closeCaseLambda4 = new Function(this, 'closeCaseFunction4', this.getLambdaProps('close-case.handler'));

    const escalateCaseLambda = new Function(this, 'escalateCaseFunction', this.getLambdaProps('escalate-case.handler'));

    const errorCatcherLambda = new Function(this, 'errorCatcherFunction', this.getLambdaProps('catcher.handler'));

    // Step Function Tasks
    const openCaseTask = new Task(this, 'Open Case', { task: new InvokeFunction(openCaseLambda) });
    const openCaseTask2 = new Task(this, 'Open Case 2', { task: new InvokeFunction(openCaseLambda2) });
    const openCaseTask3 = new Task(this, 'Open Case 3', { task: new InvokeFunction(openCaseLambda3) });
    const openCaseTask4 = new Task(this, 'Open Case 4', { task: new InvokeFunction(openCaseLambda4) });

    const assignCaseTask = new Task(this, 'Assign Case', { task: new InvokeFunction(assignCaseLambda) });
    const assignCaseTask2 = new Task(this, 'Assign Case 2', { task: new InvokeFunction(assignCaseLambda2) });
    const assignCaseTask3 = new Task(this, 'Assign Case 3', { task: new InvokeFunction(assignCaseLambda3) });
    const assignCaseTask4 = new Task(this, 'Assign Case 4', { task: new InvokeFunction(assignCaseLambda4) });

    const closeCaseTask = new Task(this, 'Close Case', { task: new InvokeFunction(closeCaseLambda) });
    const closeCaseTask2 = new Task(this, 'Close Case 2', { task: new InvokeFunction(closeCaseLambda) });
    const closeCaseTask3 = new Task(this, 'Close Case 3', { task: new InvokeFunction(closeCaseLambda) });
    const closeCaseTask4 = new Task(this, 'Close Case 4', { task: new InvokeFunction(closeCaseLambda) });

    const errorCatchingTask = new Task(this, 'Work on Case Error Catcher', { task: new InvokeFunction(errorCatcherLambda) });

    const workOnCaseTask = new Task(this, 'Work On Case', { task: new InvokeFunction(workOnCaseLambda) })
    .addRetry({
      errors: [
        "Lambda.Unknown",
        "States.TaskFailed"
      ],
      interval: Duration.seconds(3),
      maxAttempts: 2,
      backoffRate: 1.5
    })
    .addCatch(errorCatchingTask);

    const workOnCaseTask2 = new Task(this, 'Work On Case 2', { task: new InvokeFunction(workOnCaseLambda2) })
    .addCatch(closeCaseTask2)
    .addRetry({
      errors: [
        "Lambda.Unknown",
        "States.TaskFailed"
      ],
      interval: Duration.seconds(3),
      maxAttempts: 5,
      backoffRate: 1.5
    });

    const workOnCaseTask3 = new Task(this, 'Work On Case 3', { task: new InvokeFunction(workOnCaseLambda3) })
    .addCatch(closeCaseTask3);

    const workOnCaseTask4 = new Task(this, 'Work On Case 4', { task: new InvokeFunction(workOnCaseLambda4) })
    .addCatch(closeCaseTask4)
    .addRetry({
      errors: [
        "Lambda.Unknown",
        "States.TaskFailed"
      ],
      interval: Duration.seconds(3),
      maxAttempts: 5,
      backoffRate: 1.5
    });

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

    const innerParallel = new Parallel(this, 'Inner parallel').branch(workOnCaseTask4).branch(assignCaseTask2).next(assignCaseTask3);

    const secondChain = Chain.start(openCaseTask3).next(workOnCaseTask2).next(workOnCaseTask3).next(innerParallel);

    const finalChain = Chain.start(openCaseTask2);

    const parallel = new Parallel(this, 'Parallel workflow')
    .branch(chain)
    .branch(openCaseTask4)
    .next(secondChain)
    .next(assignCaseTask4)
    .next(finalChain);

    new StateMachine(this, 'State Machine Playground', {
      definition: parallel
    });
  }
}
