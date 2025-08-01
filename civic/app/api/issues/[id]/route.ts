import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '../../../lib/database';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const issueId = params.id;
    
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

    // Delete associated images from filesystem
    if (existingIssue.images) {
      try {
        const images = JSON.parse(existingIssue.images);
        for (const imagePath of images) {
          if (imagePath.startsWith('/uploads/')) {
            const fullPath = path.join(process.cwd(), 'public', imagePath);
            try {
              await unlink(fullPath);
            } catch (error) {
              console.error(`Error deleting image ${fullPath}:`, error);
              // Continue with deletion even if image file deletion fails
            }
          }
        }
      } catch (error) {
        console.error('Error parsing images JSON:', error);
      }
    }

    // Delete the issue from database
    await db.run(
      'DELETE FROM issues WHERE id = ?',
      [issueId]
    );

    return NextResponse.json(
      {
        message: 'Issue deleted successfully'
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Delete issue error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 