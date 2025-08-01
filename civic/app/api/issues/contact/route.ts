import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issueId, fromUserId, fromUserName, toUserId, toUserName, message } = body;

    if (!issueId || !fromUserName || !toUserName || !message) {
      return NextResponse.json(
        { error: 'Issue ID, from user, to user, and message are required' },
        { status: 400 }
      );
    }

    // Get database connection
    const db = await getDatabase();

    // Check if issue exists
    const existingIssue = await db.get(
      'SELECT * FROM issues WHERE id = ?',
      [issueId]
    );

    if (!existingIssue) {
      return NextResponse.json(
        { error: 'Issue not found' },
        { status: 404 }
      );
    }

    // In a real app, you would store the message in a messages table
    // For now, we'll just return success
    const messageData = {
      id: `MSG${Date.now()}`,
      issueId,
      fromUserId,
      fromUserName,
      toUserId,
      toUserName,
      message,
      createdAt: new Date().toISOString(),
      status: 'sent'
    };

    // TODO: Store message in database
    // await db.run(`
    //   INSERT INTO messages (id, issueId, fromUserId, fromUserName, toUserId, toUserName, message, createdAt, status)
    //   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    // `, [messageData.id, messageData.issueId, messageData.fromUserId, messageData.fromUserName, 
    //      messageData.toUserId, messageData.toUserName, messageData.message, messageData.createdAt, messageData.status]);

    return NextResponse.json(
      {
        message: 'Contact message sent successfully',
        messageData
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Contact message error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 