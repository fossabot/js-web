import ThreePaneLeftPane, { IThreePaneLeftPane } from './ThreePaneLeftPane';
import ThreePaneRightPane, { IThreePaneRightPane } from './ThreePaneRightPane';
import ThreePaneTopPane, { IThreePaneTopPane } from './ThreePaneTopPane';

interface IThreePane<
  T extends { id: string },
  U extends { id: string },
  V extends { id: string },
> {
  topPane: IThreePaneTopPane;
  leftPane: IThreePaneLeftPane<T, U>;
  rightPane: IThreePaneRightPane<V>;
}

const ThreePane = <
  T extends { id: string },
  U extends { id: string },
  V extends { id: string },
>({
  topPane,
  leftPane,
  rightPane,
}: IThreePane<T, U, V>) => (
  <div className="w-full p-6 lg:p-8">
    <ThreePaneTopPane {...topPane} />
    <div className="flex items-start">
      <ThreePaneLeftPane {...leftPane} />
      <ThreePaneRightPane {...rightPane} />
    </div>
  </div>
);

export default ThreePane;
