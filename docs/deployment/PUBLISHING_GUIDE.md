# Publishing Unido Apps

## Overview

This guide covers deploying your Unido app to production and preparing for ChatGPT App Store submission.

**Current Status (January 2025):**
- ✅ Apps SDK available in preview
- ✅ You can deploy and test apps now
- ⏳ App Store submissions opening later in 2025

**Stay Updated:**
- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk/)
- [Unido Discussions](https://github.com/bandofai/unido/discussions)

---

## Deployment (Available Now)

### Step 1: Build for Production

```bash
# In your Unido app directory
pnpm run build
```

Verify the build succeeded:
```bash
ls dist/
# Should show compiled JavaScript files
```

### Step 2: Deploy to HTTPS Endpoint

Choose a hosting platform and deploy your app. See [Hosting Options](HOSTING_OPTIONS.md) for detailed platform guides.

**Requirements:**
- ✅ HTTPS endpoint (ChatGPT requires secure connections)
- ✅ Publicly accessible URL
- ✅ Health check endpoint responding
- ✅ MCP server running continuously

**Quick Deploy:**

**Vercel:**
```bash
vercel
```

**Railway:**
```bash
railway up
```

**DigitalOcean:**
```bash
doctl apps create --spec app.yaml
```

### Step 3: Configure Environment

Set these environment variables on your hosting platform:

```bash
PORT=3000
NODE_ENV=production
CORS_ORIGIN=*  # Or specific origin if needed
```

### Step 4: Verify Deployment

**Test health endpoint:**
```bash
curl https://your-app.com/health
```

Should return: `{"status":"ok"}` or similar

**Test MCP endpoints:**
```bash
# Using MCP Inspector
node node_modules/@modelcontextprotocol/inspector/bin/cli.js https://your-app.com/sse --transport sse --method tools/list
```

Should list your tools.

### Step 5: Test with ChatGPT

1. **Open ChatGPT** (Desktop or Web)
2. **Go to Settings → Custom Tools → Add Server**
3. **Enter your production URL:** `https://your-app.com`
4. **Test your tools** in a conversation
5. **Verify widgets render** correctly

**Troubleshooting:** See [Debugging in ChatGPT](../providers/openai/troubleshooting.md#debugging-in-chatgpt) for common issues.

---

## App Store Publishing (Coming Soon)

### Current Status

The ChatGPT App Store submission process is **not yet open** as of January 2025. OpenAI announced that submissions will open "later in 2025."

**What You Can Do Now:**
- ✅ Deploy your app to production
- ✅ Test thoroughly in ChatGPT
- ✅ Prepare metadata and assets
- ✅ Review compliance requirements
- ⏳ Wait for submission portal to open

### Prerequisites

Based on OpenAI's Apps SDK documentation, you'll need:

#### 1. Production Deployment
- ✅ HTTPS endpoint running and stable
- ✅ Tested and working in ChatGPT
- ✅ Good performance (responses < 5 seconds)
- ✅ Error handling implemented

#### 2. App Metadata

Prepare this information now:

```yaml
name: "Your App Name"
description: "What your app does (1-2 sentences, clear and concise)"
category: "Productivity"  # or Tools, Entertainment, Education, etc.
icon: "app-icon.png"      # Dimensions TBD by OpenAI
url: "https://your-app.com"
support_email: "support@yourdomain.com"
privacy_policy_url: "https://yourdomain.com/privacy"
```

**Icon Requirements:** (Expected based on app store norms)
- High resolution (likely 512x512 or 1024x1024)
- PNG format
- Clear, recognizable design
- No text or small details

#### 3. Privacy Policy

**Required elements:**
- What data you collect
- How you use it
- How you store it
- User data rights
- Contact information

**Example Privacy Policy:**

> **Privacy Policy for [App Name]**
>
> Last Updated: [Date]
>
> **Data Collection:**
> [App Name] collects only the data necessary to provide its service:
> - User queries sent to our API
> - [List other specific data collected]
>
> **Data Usage:**
> We use collected data solely to:
> - Process user requests
> - Improve service quality
> - [Other specific uses]
>
> **Data Storage:**
> - Data is stored securely using industry-standard encryption
> - We retain data for [time period]
> - Users can request data deletion at any time
>
> **Third Parties:**
> We do not sell user data to third parties. We may share data with:
> - [List service providers, if any]
>
> **User Rights:**
> Users have the right to:
> - Request their data
> - Request data deletion
> - Opt out of data collection
>
> **Contact:**
> [support email]

#### 4. Compliance Checklist

- [ ] App follows [OpenAI Usage Policies](https://openai.com/policies/usage-policies)
- [ ] Content appropriate for all audiences
- [ ] Privacy policy published and accessible
- [ ] Collect only minimum necessary data
- [ ] Clear, helpful error messages
- [ ] App thoroughly tested in ChatGPT
- [ ] Performance acceptable (< 5s response time)
- [ ] Widgets render correctly
- [ ] No harmful, illegal, or deceptive content
- [ ] Respects user privacy

---

## Submission Process

**When submissions open (expected mid-2025):**

### Expected Steps

1. **Visit OpenAI App Store Developer Portal**
   - URL will be announced by OpenAI
   - Create developer account if needed

2. **Submit App Metadata**
   - App name and description
   - Category/tags
   - Icon/screenshots
   - Support email
   - Privacy policy link

3. **Provide Technical Details**
   - HTTPS endpoint URL
   - MCP server details
   - Widget resources (if applicable)

4. **Submit for Review**
   - Apps reviewed before appearing in store
   - Review criteria based on quality and compliance

5. **Wait for Approval**
   - Timeline TBD (expect days to weeks based on app store norms)
   - You may receive feedback for improvements

6. **Go Live**
   - Once approved, app appears in ChatGPT App Store
   - Users can discover and use your app

### Review Criteria (Expected)

**Technical Quality:**
- App works reliably
- Good performance
- Handles errors gracefully
- Well-designed widgets (if applicable)

**User Experience:**
- Clear, helpful descriptions
- Intuitive to use
- Provides value to users
- Good documentation

**Compliance:**
- Follows usage policies
- Appropriate content
- Privacy policy compliant
- Minimum data collection

**Featured Apps:**
Higher standards may be required for featured placement:
- Exceptional design
- Outstanding user experience
- Innovative functionality
- Strong user ratings (after launch)

---

## Post-Submission

### If Approved

1. **Announce Your Launch**
   - Social media
   - Blog post
   - Developer communities

2. **Monitor User Feedback**
   - ChatGPT reviews (when available)
   - Support emails
   - Bug reports

3. **Iterate and Improve**
   - Fix reported issues quickly
   - Add requested features
   - Update regularly

### If Rejected

1. **Review Feedback**
   - Understand rejection reasons
   - Ask for clarification if needed

2. **Make Improvements**
   - Address all concerns
   - Test thoroughly

3. **Resubmit**
   - Follow any specific guidance provided
   - Explain changes made

---

## Updating Your App

### Code Updates

1. **Deploy changes** to your production server
2. **Test thoroughly** in ChatGPT
3. **No resubmission needed** for backend updates

Your app updates automatically since it's running on your server.

### Metadata Updates

If you need to change:
- App name or description
- Icon
- Privacy policy
- Category

You'll likely need to submit an update through the App Store portal (process TBD).

---

## Best Practices

### Before Launch

- [ ] Test with multiple users
- [ ] Load test your server
- [ ] Set up monitoring and alerts
- [ ] Prepare support documentation
- [ ] Have a rollback plan

### During Review

- [ ] Respond quickly to any questions
- [ ] Be available for follow-up
- [ ] Have test accounts ready if needed

### After Launch

- [ ] Monitor server logs daily
- [ ] Respond to user feedback promptly
- [ ] Track usage metrics
- [ ] Plan regular updates

---

## Marketing Your App

### When Your App is Live

**App Store Optimization:**
- Clear, compelling description
- Good keywords in description
- Quality icon/screenshots
- Regular updates show active development

**Community Outreach:**
- Share on Twitter, LinkedIn
- Post in relevant Reddit communities
- Write blog post about your app
- Engage with users

**User Acquisition:**
- Offer clear value proposition
- Make onboarding smooth
- Provide good documentation
- Be responsive to feedback

---

## Support and Maintenance

### Setting Up Support

**Support Email:**
- Create dedicated support email
- Set up auto-responder
- Aim for < 24hr response time

**Documentation:**
- FAQ for common questions
- How-to guides
- Troubleshooting tips

**Monitoring:**
- Server uptime monitoring
- Error tracking
- Performance metrics

### Ongoing Maintenance

**Weekly:**
- [ ] Check server logs
- [ ] Review error reports
- [ ] Monitor performance

**Monthly:**
- [ ] Review user feedback
- [ ] Plan feature updates
- [ ] Update dependencies
- [ ] Check security advisories

**Quarterly:**
- [ ] Major feature releases
- [ ] User satisfaction survey
- [ ] Competitive analysis
- [ ] Roadmap planning

---

## Monetization (Future)

While not currently available, OpenAI may introduce monetization options for app developers:

**Potential Models:**
- Freemium (free basic, paid premium features)
- Subscription
- Usage-based pricing
- One-time purchase

**Prepare Now:**
- Build valuable features
- Grow user base
- Track usage metrics
- Understand user willingness to pay

---

## Resources

### Official Documentation
- [OpenAI Apps SDK](https://developers.openai.com/apps-sdk/)
- [OpenAI Usage Policies](https://openai.com/policies/usage-policies)
- [OpenAI Platform Status](https://status.openai.com/)

### Unido Resources
- [Hosting Options Guide](HOSTING_OPTIONS.md)
- [Debugging in ChatGPT](../providers/openai/troubleshooting.md#debugging-in-chatgpt)
- [Examples](../../examples/)
- [Community Discussions](https://github.com/bandofai/unido/discussions)

### Tools
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector) - Test MCP endpoints
- [Postman](https://www.postman.com/) - API testing
- [Better Uptime](https://betteruptime.com/) - Monitoring (free tier)

---

## FAQs

**Q: When exactly will App Store submissions open?**
A: OpenAI has said "later in 2025" but no specific date announced. Check the [OpenAI Apps SDK page](https://developers.openai.com/apps-sdk/) for updates.

**Q: Can I deploy my app before the App Store opens?**
A: Yes! You can deploy to production and test in ChatGPT right now using Custom Tools.

**Q: Will there be a review process?**
A: Yes, based on OpenAI's announcement, apps will be reviewed before appearing in the store.

**Q: Can I charge for my app?**
A: Monetization options haven't been announced yet. You can implement your own payment system if needed.

**Q: What if my app gets rejected?**
A: You'll likely receive feedback and can resubmit after making improvements.

**Q: Do I need to rebuild my app when the store opens?**
A: No, apps deployed now should work with the App Store. You'll just need to submit metadata.

---

## Stay Informed

**Check for Updates:**
- [OpenAI Developer Blog](https://platform.openai.com/blog)
- [Unido GitHub Discussions](https://github.com/bandofai/unido/discussions)
- Follow [@OpenAI](https://twitter.com/OpenAI) on Twitter

**Questions or Feedback:**
- [Open a GitHub Discussion](https://github.com/bandofai/unido/discussions)
- [File an Issue](https://github.com/bandofai/unido/issues)

---

**Ready to deploy?** Start with our [Hosting Options Guide](HOSTING_OPTIONS.md)!
