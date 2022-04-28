import { User } from '@seaccentral/core/dist/user/User.entity';

export default function invitedUserTransformer({ value }: { value: User }) {
  if (!value) {
    return {};
  }
  return {
    id: value.id,
    firstName: value.firstName,
    lastName: value.lastName,
  };
}
