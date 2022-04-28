resource "aws_instance" "ec2_bastion" {
  ami                         = var.bastion_host_ami_id
  instance_type               = "t2.micro"
  key_name                    = var.bastion_host_key_name
  subnet_id                   = aws_subnet.primary_public_subnet.id
  vpc_security_group_ids      = [aws_security_group.bastion_sg.id, aws_security_group.db_access_sg.id, aws_security_group.cache_access_sg.id]
  user_data                   = file("install_resources_to_bastion.sh")
  availability_zone           = var.availability_zones[0]
  associate_public_ip_address = true

  tags = {
    name = "${var.app_group}-${var.environment_name}-ec2-bastion-host"
  }
}

resource "aws_security_group" "bastion_sg" {
  name        = "bastion_allow_ssh_traffic_sg"
  description = "Allow ssh inbound traffic"
  vpc_id      = aws_vpc.vpc.id

  ingress {
    protocol    = "tcp"
    from_port   = 22
    to_port     = 22
    cidr_blocks = var.bastion_host_cidr_block
  }

  egress {
    protocol         = -1
    from_port        = 0
    to_port          = 0
    cidr_blocks      = ["0.0.0.0/0"]
    ipv6_cidr_blocks = ["::/0"]
  }
}
