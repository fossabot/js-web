import withAuth from '../../src/app-state/auth';
import { EventCalendarPage } from '../../src/event-calendar/EventCalendarPage';

export default withAuth(EventCalendarPage);
