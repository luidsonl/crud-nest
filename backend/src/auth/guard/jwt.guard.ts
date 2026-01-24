import { AuthGuard } from '@nestjs/passport';

class jwtGuard extends AuthGuard('jwt') {
  constructor() {
    super();
  }
}

export { jwtGuard };
