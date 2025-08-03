# DynastyLab AI Features Documentation

## Overview

DynastyLab uses OpenAI's GPT-3.5 and DALL-E models to generate dynamic, context-aware content throughout the application. All AI features respect your team selection and AI content settings.

## AI-Powered Features

### 1. News Hub
- **Dynamic Articles**: AI generates full-length sports articles based on your game results
- **Writer Personalities**: Multiple AI writers with distinct styles:
  - **Enthusiastic**: Passionate, optimistic coverage
  - **Critical**: Analytical, points out flaws even in wins
  - **Analytical**: Stats-focused, strategic analysis
- **Article Images**: DALL-E generates relevant images for each article
- **News Ticker**: Breaking news updates based on recent events
- **Article Comments**: AI fans respond to articles with team-appropriate commentary

### 2. Fan Forum
- **AI Responses**: Fans respond to your posts with personality-based replies
- **Fan Archetypes**:
  - **Eternal Optimist**: Always positive, finds silver linings
  - **Stats Nerd**: Focuses on analytics and metrics
  - **Old Timer**: References past seasons, nostalgic
  - **Doomer**: Pessimistic, expects the worst
  - **Reasonable**: Balanced takes, rational analysis
- **Nested Conversations**: AI fans engage in threaded discussions
- **Context Awareness**: Responses consider game results and team performance

### 3. Coaching Commentary
- **Hot Seat Analysis**: AI discusses coaching performance
- **Context-Based**: Considers recent record and blowout losses
- **Fan Sentiment**: Reflects realistic fan reactions to coaching

### 4. Recruiting Posts
- **Commitment Reactions**: AI celebrates new recruits
- **Position Analysis**: Comments on team needs
- **Recruiting Class Context**: References overall class strength

## AI Content Settings

Control which teams receive AI-generated content to manage API costs:

### Core Content (Your Team Always Enabled)
- Game recaps and analysis
- Recruiting news and reactions
- Team performance analysis

### Extended Coverage
- **Rival Teams**: Year-round coverage of rivals
- **Conference Updates**: Coverage of conference opponents
- **National Stories**: When ranked or in playoffs
- **Opponent Previews**: Automatic during game week

### Smart Features
- **Auto-Enable Opponents**: Activates coverage for upcoming games
- **Ranking Detection**: Enables when teams enter rankings
- **Playoff Coverage**: Activates for playoff contenders

## Testing AI Features

Navigate to `/ai-test` to access the AI Feature Test Suite:

1. **Generate Sports Article**: Test article generation with different scenarios
2. **Generate News Ticker**: Create breaking news items
3. **Generate Forum Response**: Test different fan personalities
4. **Generate Coaching Discussion**: Test hot seat commentary
5. **Generate Recruiting Post**: Test recruiting excitement
6. **Generate Article Image**: Test DALL-E image generation

## API Configuration

### Environment Setup
1. Create a `.env` file in the project root
2. Add your OpenAI API key:
   ```
   VITE_OPENAI_API_KEY=your_openai_api_key_here
   ```
3. Restart the development server to load the environment variable

### Cost Management
- AI content is only generated for enabled teams
- Use AI Settings to control which teams get coverage
- Forum responses are limited to 0-3 per post
- Article generation happens on-demand

## Troubleshooting

### "401 Unauthorized" Error
- Verify your API key is correctly set in `.env`
- Ensure the dev server was restarted after adding the key
- Check that the key has not expired

### No AI Responses in Forum
- Verify the team has AI content enabled
- Check browser console for errors
- Ensure you're posting in a team forum (not general)

### Images Not Generating
- DALL-E requires additional API permissions
- Check your OpenAI account limits
- Fallback placeholder images will be used

### Content Not Updating
- AI content is generated on-demand, not automatically
- Refresh the page to trigger new content
- Check AI Settings to ensure team is enabled

## Best Practices

1. **Start Small**: Enable AI for just your team initially
2. **Monitor Usage**: Check OpenAI dashboard for API usage
3. **Use Smart Features**: Let auto-enable handle opponent coverage
4. **Cache Content**: Generated content persists in localStorage
5. **Test First**: Use the AI test page before enabling broadly

## Future Enhancements

- GPT-4 support for enhanced content quality
- Voice commentary generation
- Real-time game simulation narratives
- Advanced statistical analysis
- Custom writer personality creation