# Frequently Asked Questions

## General

**Q: Can both buyer and seller initiate escrow?**  
A: Yes! Either party can initiate an escrow transaction.

**Q: What payment gateways are supported?**  
A: Paystack and Monnify are currently supported.

**Q: How long does an escrow last?**  
A: Default is 7 days, configurable up to 30 days.

## Technical

**Q: What database is used?**  
A: PostgreSQL 15+ is the primary database.

**Q: How are background jobs processed?**  
A: BullMQ with Redis handles all background jobs (notifications, payouts, etc.).

**Q: Is the platform scalable?**  
A: Yes, the microservices architecture allows horizontal scaling of individual services.

## Security

**Q: How are payments secured?**  
A: Webhook signatures are verified using HMAC, and all payments are idempotent.

**Q: How is authentication handled?**  
A: OTP-based login with JWT tokens for API access.

**Q: Are admin routes protected?**  
A: Yes, admin routes require authentication, admin role, and IP allowlist.

## Deployment

**Q: Can I deploy with Docker?**  
A: Yes, full Docker Compose configuration is provided in `/infra`.

**Q: What's the minimum server requirements?**  
A: 2GB RAM, 2 CPU cores for basic setup. Scale based on traffic.

**Q: Do I need SSL certificates?**  
A: Yes, HTTPS is required in production for security.

## Support

**Q: Where can I report issues?**  
A: Use the GitHub Issues page for bug reports and feature requests.

**Q: Is there API documentation?**  
A: Yes, see `/docs/api-spec.md` for full API documentation.

