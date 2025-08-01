import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { issueId, userId } = body;

    if (!issueId) {
      return NextResponse.json(
        { error: 'Issue ID is required' },
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

    // Check if user already voted (in a real app, you'd have a votes table)
    // For now, we'll just increment the vote count
    const currentVotes = existingIssue.votes || 0;
    const newVotes = currentVotes + 1;

    // Update issue votes
    await db.run(
      'UPDATE issues SET votes = ?, updatedAt = ? WHERE id = ?',
      [newVotes, new Date().toISOString(), issueId]
    );

    // Get the updated issue
    const updatedIssue = await db.get(
      'SELECT * FROM issues WHERE id = ?',
      [issueId]
    );

    // Parse images JSON
    if (updatedIssue.images) {
      try {
        updatedIssue.images = JSON.parse(updatedIssue.images);
      } catch (e) {
        updatedIssue.images = [];
      }
    } else {
      updatedIssue.images = [];
    }

    return NextResponse.json(
      {
        message: 'Vote recorded successfully',
        issue: updatedIssue,
        newVoteCount: newVotes
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Vote error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 