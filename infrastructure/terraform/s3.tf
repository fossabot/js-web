resource "aws_s3_bucket" "main_bucket" {
  bucket = "${var.app_group}-${var.environment_name}-bucket"
  acl    = "private"

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = [
      "GET",
      "HEAD",
      "PUT",
      "POST",
      "DELETE"
    ]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }

  versioning {
    enabled = var.enable_aws_s3_bucket_versioning
  }

  tags = {
    Name        = "${var.app_group}-${var.environment_name}-bucket"
    Environment = var.environment_name
  }
}

resource "aws_s3_bucket_public_access_block" "central_platform_s3_block" {
  bucket                  = aws_s3_bucket.main_bucket.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_cloudfront_distribution" "central_platform_cf" {
  enabled = true
  aliases = var.central_platform_cloudfront_aliases

  origin {
    domain_name = aws_s3_bucket.main_bucket.bucket_regional_domain_name
    origin_id   = aws_s3_bucket.main_bucket.bucket_regional_domain_name
    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.central_platform_oai.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD", "OPTIONS"]
    cached_methods         = ["GET", "HEAD", "OPTIONS"]
    target_origin_id       = aws_s3_bucket.main_bucket.bucket_regional_domain_name
    viewer_protocol_policy = "redirect-to-https"
    forwarded_values {
      query_string = true

      cookies {
        forward = "all"
      }
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn = var.acm_ssl_certificate_for_cdn_arn
    ssl_support_method  = "sni-only"
  }

  tags = {
    Name        = "${var.app_group}-${var.environment_name}-cdn"
    Environment = var.environment_name
  }
}

resource "aws_cloudfront_origin_access_identity" "central_platform_oai" {
  comment = "OAI for ${var.central_platform_cloudfront_aliases[0]}"
}

resource "aws_s3_bucket_policy" "central_platform_cdn_s3_policy" {
  bucket = aws_s3_bucket.main_bucket.id
  policy = data.aws_iam_policy_document.central_platform_cdn_s3_policy_data.json
}

data "aws_iam_policy_document" "central_platform_cdn_s3_policy_data" {
  statement {
    actions = ["s3:GetObject"]
    resources = [
      aws_s3_bucket.main_bucket.arn,
      "${aws_s3_bucket.main_bucket.arn}/assets/*"
    ]

    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.central_platform_oai.iam_arn]
    }
  }
}
