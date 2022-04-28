# Create the Load balancer Security Group
resource "aws_security_group" "alb_security_group" {
  vpc_id      = aws_vpc.vpc.id
  name        = "${var.app_group}-${var.environment_name} ELB Security Group"
  description = "${var.app_group}-${var.environment_name} ELB"

  # allow ingress of HTTPS port
  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
  }
  # allow ingress of HTTP port
  ingress {
    cidr_blocks = ["0.0.0.0/0"]
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
  }

  egress {
    protocol         = "-1"
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
} # end resource

# Create the Application Load Balancer
resource "aws_lb" "alb" {
  name               = "seac-${var.environment_name}-alb"
  load_balancer_type = "application"
  ip_address_type    = "ipv4"
  internal           = false
  subnets            = [aws_subnet.primary_public_subnet.id, aws_subnet.secondary_public_subnet.id]
  security_groups    = [aws_security_group.alb_security_group.id]
} # end resource

# Create the Application Load Balancer Web Target group
resource "aws_lb_target_group" "alb_web_target_group" {
  name                 = "seac-${var.environment_name}-alb-web-tg"
  port                 = var.nginx_app_container_port
  protocol             = "HTTP"
  target_type          = "ip"
  vpc_id               = aws_vpc.vpc.id
  deregistration_delay = 60
  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    matcher             = "200,302"
  }
} # end resource


# Create the Application Load Balancer Auth Target group
resource "aws_lb_target_group" "alb_auth_target_group" {
  name                 = "seac-${var.environment_name}-alb-auth-tg"
  port                 = var.auth_app_container_port
  protocol             = "HTTP"
  target_type          = "ip"
  vpc_id               = aws_vpc.vpc.id
  deregistration_delay = 60
  health_check {
    path                = "/api/auth/v1/healthcheck"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    matcher             = "200"
  }
} # end resource


# Create the Application Load Balancer Central Target group
resource "aws_lb_target_group" "alb_central_target_group" {
  name                 = "seac-${var.environment_name}-alb-central-tg"
  port                 = var.central_app_container_port
  protocol             = "HTTP"
  target_type          = "ip"
  vpc_id               = aws_vpc.vpc.id
  deregistration_delay = 60
  health_check {
    path                = "/api/central/v1/admin/healthcheck"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
    matcher             = "200"
  }
} # end resource

# Create the Application Load Balancer Central Target group
resource "aws_lb_target_group" "alb_payment_target_group" {
  name                 = "seac-${var.environment_name}-alb-payment-tg"
  port                 = var.payment_app_container_port
  protocol             = "HTTP"
  target_type          = "ip"
  vpc_id               = aws_vpc.vpc.id
  deregistration_delay = 60
  health_check {
    path                = "/api/payment/v1/healthcheck"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
  }
} # end resource

# Create the Application Load Balancer Central Target group
resource "aws_lb_target_group" "alb_notification_target_group" {
  name                 = "seac-${var.environment_name}-alb-notif-tg"
  port                 = var.notification_app_container_port
  protocol             = "HTTP"
  target_type          = "ip"
  vpc_id               = aws_vpc.vpc.id
  deregistration_delay = 60
  health_check {
    path                = "/api/notification/v1/healthcheck"
    healthy_threshold   = 2
    unhealthy_threshold = 2
    timeout             = 5
  }
} # end resource

# Create the main web listener for the application load balancer
resource "aws_lb_listener" "main_web_https_listener" {
  load_balancer_arn = aws_lb.alb.arn
  port              = "443"
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-2016-08"
  certificate_arn   = var.acm_ssl_certificate_arn

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.alb_web_target_group.arn
  }
}

resource "aws_lb_listener" "main_web_http_listener" {
  load_balancer_arn = aws_lb.alb.arn
  port              = "80"
  protocol          = "HTTP"

  default_action {
    type = "redirect"
    redirect {
      port        = "443"
      protocol    = "HTTPS"
      status_code = "HTTP_301"
    }
  }
}
# end resource

# Create Listener Rules for the Auth API
resource "aws_lb_listener_rule" "api_auth_listener_rule" {
  action {
    target_group_arn = aws_lb_target_group.alb_auth_target_group.arn
    type             = "forward"
  }


  condition {
    path_pattern {
      values = ["/api/auth*", "/api/auth/*"]
    }
  }

  listener_arn = aws_lb_listener.main_web_https_listener.arn
  priority     = 1
}
# end resource


# Create Listener Rules for the Payment API
resource "aws_lb_listener_rule" "api_payment_listener_rule" {
  action {
    target_group_arn = aws_lb_target_group.alb_payment_target_group.arn
    type             = "forward"
  }

  condition {
    path_pattern {
      values = ["/api/payment*", "/api/payment/*"]
    }
  }

  listener_arn = aws_lb_listener.main_web_https_listener.arn
  priority     = 2
}
# end resource


# Create Listener Rules for the Central API
resource "aws_lb_listener_rule" "api_central_listener_rule" {
  action {
    target_group_arn = aws_lb_target_group.alb_central_target_group.arn
    type             = "forward"
  }

  condition {
    path_pattern {
      values = ["/api/central*", "/api/central/*"]
    }
  }

  listener_arn = aws_lb_listener.main_web_https_listener.arn
  priority     = 3
}
# end resource

# Create Listener Rules for the Notification API
resource "aws_lb_listener_rule" "api_notification_listener_rule" {
  action {
    target_group_arn = aws_lb_target_group.alb_notification_target_group.arn
    type             = "forward"
  }

  condition {
    path_pattern {
      values = ["/api/notification*", "/api/notification/*", "/sock/notification*"]
    }
  }

  listener_arn = aws_lb_listener.main_web_https_listener.arn
  priority     = 4
}
# end resource
